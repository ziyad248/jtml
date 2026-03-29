import type { JTMLDecodeOptions, JTMLSchema } from './types';
import { JTMLError } from './types';
import { parseSchema, schemaManager } from './schema';

export class JTMLDecoder {
  /**
   * Decode JTML format to JSON
   */
  decode(jtml: string, options: JTMLDecodeOptions = {}): unknown {
    const { schemaCache, strict = true } = options;

    // Merge provided schema cache
    if (schemaCache) {
      schemaCache.forEach((schema, _id) => {
        schemaManager.register(schema);
      });
    }

    const lines = jtml.trim().split('\n');
    let schema: JTMLSchema | undefined;
    let dataStartIndex = 0;
    let metadata: Record<string, unknown> = {};

    // Parse header and schema
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('@schema')) {
        // Inline schema definition
        if (i + 1 >= lines.length) {
          throw new JTMLError('Incomplete schema definition: missing field definitions', 'SCHEMA_PARSE_ERROR');
        }
        const schemaLines = [line, lines[i + 1]];
        schema = parseSchema(schemaLines.join('\n'));
        schemaManager.register(schema);
        i++; // Skip next line (field definitions)
      } else if (line.startsWith('@ref')) {
        // Reference to existing schema
        const schemaId = line.split(/\s+/)[1];
        if (!schemaId) {
          throw new JTMLError('Missing schema ID in @ref directive', 'SCHEMA_PARSE_ERROR');
        }
        schema = schemaManager.get(schemaId);
        if (!schema) {
          throw new JTMLError(`Schema not found: ${schemaId}`, 'SCHEMA_NOT_FOUND');
        }
      } else if (line === '@data') {
        dataStartIndex = i + 1;
        break;
      }
    }

    if (!schema && strict) {
      throw new JTMLError('No schema found in JTML data', 'SCHEMA_REQUIRED');
    }

    // Find metadata section
    let metaStartIndex = -1;
    for (let i = dataStartIndex; i < lines.length; i++) {
      if (lines[i].trim() === '@meta') {
        metaStartIndex = i + 1;
        break;
      }
    }

    // Determine data end index
    const dataEndIndex = metaStartIndex > 0 ? metaStartIndex - 1 : lines.length;

    // Parse data rows
    const rawDataLines = lines.slice(dataStartIndex, dataEndIndex).filter(l => l.trim());
    const isArrayEncoding = rawDataLines[0]?.trim() === '@array';
    const dataLines = isArrayEncoding ? rawDataLines.slice(1) : rawDataLines;
    const results: unknown[] = [];

    if (schema) {
      for (const line of dataLines) {
        if (line.trim()) {
          results.push(this.decodeRow(line, schema));
        }
      }
    } else {
      // Fallback: parse as JSON
      for (const line of dataLines) {
        if (line.trim()) {
          results.push(JSON.parse(line));
        }
      }
    }

    // Parse metadata if present
    if (metaStartIndex > 0) {
      for (let i = metaStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('@')) {
          const colonIdx = line.indexOf(':');
          if (colonIdx === -1) continue;
          const key = line.slice(0, colonIdx);
          const value = line.slice(colonIdx + 1);
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
          metadata[key] = this.decodeValue(value);
        }
      }
    }

    // Return single object or array
    if (!isArrayEncoding && results.length === 1 && Object.keys(metadata).length === 0) {
      return results[0];
    }

    if (Object.keys(metadata).length > 0) {
      return {
        data: results.length === 1 ? results[0] : results,
        metadata
      };
    }

    return results;
  }

  /**
   * Decode a single row according to schema
   */
  private decodeRow(line: string, schema: JTMLSchema): Record<string, unknown> {
    const values = this.splitRow(line);
    const result: Record<string, unknown> = {};

    if (values.length !== schema.fields.length) {
      throw new JTMLError(
        `Row has ${values.length} values but schema expects ${schema.fields.length}`,
        'SCHEMA_MISMATCH'
      );
    }

    for (let i = 0; i < schema.fields.length; i++) {
      const field = schema.fields[i];
      const rawValue = values[i];

      if (rawValue === '' || rawValue === null) {
        result[field.name] = null;
      } else {
        result[field.name] = this.decodeValue(rawValue, field.typeInfo.type);
      }
    }

    return result;
  }

  /**
   * Split row by pipe delimiter, handling escaped pipes
   */
  private splitRow(line: string): string[] {
    const parts: string[] = [];
    let current = '';
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (escaped) {
        if (char === 'n') {
          current += '\n';
        } else if (char === '\\') {
          current += '\\';
        } else if (char === '|') {
          current += '|';
        } else {
          current += char;
        }
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '|') {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    parts.push(current);
    return parts;
  }

  /**
   * Decode a single value
   */
  private decodeValue(value: string | undefined, type?: string): unknown {
    if (value === undefined || value === '' || value === null) {
      return null;
    }

    // Boolean
    if (type === 'b') {
      return value === '1' || value === 'true';
    }

    // Number
    if (type === 'i' || type === 'f') {
      const num = type === 'i' ? parseInt(value, 10) : parseFloat(value);
      if (!isFinite(num)) {
        throw new JTMLError(`Invalid numeric value: ${value}`, 'INVALID_VALUE');
      }
      return num;
    }

    // Auto-detect number
    if (!type && /^-?\d+(\.\d+)?$/.test(value)) {
      return value.includes('.') ? parseFloat(value) : parseInt(value, 10);
    }

    // Array
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1);
      if (!inner) return [];
      return inner.split(',').map(v => this.decodeValue(v.trim(), type));
    }

    // Object
    if (value.startsWith('{') && value.endsWith('}')) {
      const inner = value.slice(1, -1);
      const obj = Object.create(null) as Record<string, unknown>;
      if (!inner) return obj;

      const pairs = inner.split(',');
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) continue;
        const k = pair.slice(0, colonIdx).trim();
        const v = pair.slice(colonIdx + 1).trim();
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        obj[k] = this.decodeValue(v);
      }
      return obj;
    }

    // String (default)
    return value;
  }
}

export const decoder = new JTMLDecoder();

/**
 * Convenience function to decode JTML to JSON
 */
export function decode(jtml: string, options?: JTMLDecodeOptions): unknown {
  return decoder.decode(jtml, options);
}
