import type { JTMLEncodeOptions, JTMLSchema } from './types';
import { JTMLError } from './types';
import { inferSchema, serializeSchema, schemaManager } from './schema';

export class JTMLEncoder {
  /**
   * Encode JSON data to JTML format
   */
  encode(data: unknown, options: JTMLEncodeOptions = {}): string {
    const {
      schemaId = 'default',
      schemaRef,
      autoInferTypes = true,
      includeSchema = true
    } = options;

    let schema: JTMLSchema | undefined;

    // Use existing schema reference
    if (schemaRef) {
      schema = schemaManager.get(schemaRef);
      if (!schema) {
        throw new JTMLError(`Schema not found: ${schemaRef}`, 'SCHEMA_NOT_FOUND');
      }
      return this.encodeWithSchema(data, schema, false);
    }

    // Auto-infer schema
    if (autoInferTypes) {
      schema = inferSchema(data, schemaId);
      schemaManager.register(schema);
    }

    if (schema) {
      return this.encodeWithSchema(data, schema, includeSchema);
    }

    // Fallback: simple encoding without schema
    return this.encodeSimple(data);
  }

  /**
   * Encode with explicit schema
   */
  private encodeWithSchema(data: unknown, schema: JTMLSchema, includeSchema: boolean): string {
    const parts: string[] = [];

    // Add schema definition
    if (includeSchema) {
      parts.push(serializeSchema(schema));
      parts.push('');
      parts.push('@data');
    } else {
      parts.push(`@ref ${schema.id}`);
      parts.push('@data');
    }

    // Encode data rows
    if (Array.isArray(data)) {
      parts.push('@array');
      for (const item of data) {
        parts.push(this.encodeRow(item, schema));
      }
    } else if (typeof data === 'object' && data !== null) {
      parts.push(this.encodeRow(data, schema));
    }

    return parts.join('\n');
  }

  /**
   * Encode a single row according to schema
   */
  private encodeRow(item: unknown, schema: JTMLSchema): string {
    if (typeof item !== 'object' || item === null) {
      throw new JTMLError('Cannot encode non-object item', 'INVALID_DATA');
    }

    const values: string[] = [];
    const obj = item as Record<string, unknown>;

    for (const field of schema.fields) {
      const value = obj[field.name];
      values.push(this.encodeValue(value));
    }

    return values.join('|');
  }

  /**
   * Encode a single value
   */
  private encodeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'string') {
      // Escape special characters
      return value
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|')
        .replace(/\n/g, '\\n');
    }

    if (Array.isArray(value)) {
      return `[${value.map(v => this.encodeValue(v)).join(',')}]`;
    }

    if (typeof value === 'object') {
      return `{${Object.entries(value)
        .map(([k, v]) => `${k}:${this.encodeValue(v)}`)
        .join(',')}}`;
    }

    return String(value);
  }

  /**
   * Simple encoding without schema (fallback)
   */
  private encodeSimple(data: unknown): string {
    if (Array.isArray(data)) {
      return data.map(item => JSON.stringify(item)).join('\n');
    }
    return JSON.stringify(data);
  }

  /**
   * Encode with metadata
   */
  encodeWithMetadata(
    data: unknown,
    metadata: Record<string, unknown>,
    options: JTMLEncodeOptions = {}
  ): string {
    const dataEncoded = this.encode(data, options);
    const metaParts: string[] = ['', '@meta'];

    for (const [key, value] of Object.entries(metadata)) {
      metaParts.push(`${key}:${this.encodeValue(value)}`);
    }

    return dataEncoded + '\n' + metaParts.join('\n');
  }
}

export const encoder = new JTMLEncoder();

/**
 * Convenience function to encode JSON to JTML
 */
export function encode(data: unknown, options?: JTMLEncodeOptions): string {
  return encoder.encode(data, options);
}

/**
 * Encode multiple datasets with shared schema
 */
export function encodeBatch(
  datasets: unknown[],
  schemaId: string = 'batch'
): string {
  if (datasets.length === 0) {
    throw new JTMLError('Cannot encode empty batch', 'INVALID_DATA');
  }

  // Infer schema from first dataset
  const schema = inferSchema(datasets[0], schemaId);
  schemaManager.register(schema);

  const parts: string[] = [];
  parts.push(serializeSchema(schema));
  parts.push('');

  // Encode each dataset
  datasets.forEach((data, index) => {
    parts.push(`@batch ${index}`);
    const encoded = encoder.encode(data, { 
      schemaRef: schemaId, 
      includeSchema: false 
    });
    parts.push(encoded);
    parts.push('');
  });

  return parts.join('\n');
}
