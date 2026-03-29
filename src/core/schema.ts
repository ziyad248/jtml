import type { JTMLSchema, JTMLField, JTMLTypeInfo, JTMLType } from './types';
import { JTMLError } from './types';

export class SchemaManager {
  private schemas = new Map<string, JTMLSchema>();

  /**
   * Register a schema for reuse
   */
  register(schema: JTMLSchema): void {
    this.schemas.set(schema.id, schema);
  }

  /**
   * Get a registered schema
   */
  get(id: string): JTMLSchema | undefined {
    return this.schemas.get(id);
  }

  /**
   * Check if schema exists
   */
  has(id: string): boolean {
    return this.schemas.has(id);
  }

  /**
   * Clear all schemas
   */
  clear(): void {
    this.schemas.clear();
  }

  /**
   * Export all schemas
   */
  export(): JTMLSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Import schemas
   */
  import(schemas: JTMLSchema[]): void {
    schemas.forEach(schema => this.register(schema));
  }
}

/**
 * Infer JTML type from JavaScript value
 */
export function inferType(value: unknown): JTMLTypeInfo {
  if (value === null || value === undefined) {
    return { type: 'n' };
  }

  if (typeof value === 'boolean') {
    return { type: 'b' };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'i' } : { type: 'f' };
  }

  if (typeof value === 'string') {
    // Check if it's a timestamp
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return { type: 't' };
    }
    return { type: 's' };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'a' };
    }
    const firstItemType = inferType(value[0]);
    return { type: 'a', arrayOf: firstItemType.type };
  }

  if (typeof value === 'object') {
    return { type: 'o' };
  }

  throw new JTMLError(`Cannot infer type for value: ${value}`, 'TYPE_INFERENCE_ERROR');
}

/**
 * Infer schema from JSON data
 */
export function inferSchema(data: unknown, schemaId: string): JTMLSchema {
  if (!Array.isArray(data) && typeof data !== 'object') {
    throw new JTMLError('Schema inference requires array or object data', 'INVALID_DATA');
  }

  const fields: JTMLField[] = [];
  const sample = Array.isArray(data) ? data[0] : data;

  if (!sample || typeof sample !== 'object') {
    throw new JTMLError('Cannot infer schema from empty or non-object data', 'INVALID_DATA');
  }

  for (const [key, value] of Object.entries(sample)) {
    const typeInfo = inferType(value);
    
    // Check if field is optional by scanning all items
    let optional = false;
    if (Array.isArray(data)) {
      optional = data.some(item => 
        item[key] === null || item[key] === undefined
      );
    }

    fields.push({
      name: key,
      typeInfo: { ...typeInfo, optional }
    });
  }

  return {
    id: schemaId,
    fields,
    version: '1.0'
  };
}

/**
 * Serialize schema to JTML format
 */
export function serializeSchema(schema: JTMLSchema): string {
  const fieldDefs = schema.fields.map(field => {
    let def = `${field.name}:${field.typeInfo.type}`;
    
    if (field.typeInfo.arrayOf) {
      def += `[]`;
    }
    
    if (field.typeInfo.enumValues) {
      def += `[${field.typeInfo.enumValues.join(',')}]`;
    }
    
    if (field.typeInfo.refSchema) {
      def += `[${field.typeInfo.refSchema}]`;
    }
    
    if (field.typeInfo.optional) {
      def += '?';
    }
    
    return def;
  }).join(' ');

  return `@schema ${schema.id}\n${fieldDefs}`;
}

/**
 * Parse schema from JTML format
 */
export function parseSchema(schemaStr: string): JTMLSchema {
  const lines = schemaStr.trim().split('\n');
  const headerMatch = lines[0].match(/^@schema\s+(\S+)/);
  
  if (!headerMatch) {
    throw new JTMLError('Invalid schema format', 'SCHEMA_PARSE_ERROR');
  }

  const schemaId = headerMatch[1];
  if (lines.length < 2 || !lines[1]) {
    throw new JTMLError('Schema is missing field definitions', 'SCHEMA_PARSE_ERROR');
  }
  const fieldLine = lines[1];
  const fields: JTMLField[] = [];

  const fieldDefs = fieldLine.split(/\s+/);
  
  for (const fieldDef of fieldDefs) {
    const match = fieldDef.match(/^(\w+):([ifsbtnoae]+)(\[\])?(\[([^\]]+)\])?(\?)?$/);
    
    if (!match) {
      throw new JTMLError(`Invalid field definition: ${fieldDef}`, 'SCHEMA_PARSE_ERROR');
    }

    const [, name, type, isArray, , enumOrRef, isOptional] = match;

    const typeInfo: JTMLTypeInfo = {
      type: type as JTMLType,
      optional: !!isOptional
    };

    if (isArray) {
      typeInfo.arrayOf = type as JTMLType;
    }

    if (enumOrRef) {
      if (type === 'e') {
        typeInfo.enumValues = enumOrRef.split(',');
      } else if (type === 'ref') {
        typeInfo.refSchema = enumOrRef;
      }
    }

    fields.push({ name, typeInfo });
  }

  return {
    id: schemaId,
    fields,
    version: '1.0'
  };
}

/**
 * Validate data against schema
 */
export function validateAgainstSchema(data: unknown, schema: JTMLSchema): boolean {
  if (Array.isArray(data)) {
    return data.every(item => validateItem(item, schema));
  }
  return validateItem(data, schema);
}

function validateItem(item: unknown, schema: JTMLSchema): boolean {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  for (const field of schema.fields) {
    const value = (item as Record<string, unknown>)[field.name];
    
    if (value === null || value === undefined) {
      if (!field.typeInfo.optional) {
        return false;
      }
      continue;
    }

    const actualType = inferType(value);
    if (actualType.type !== field.typeInfo.type) {
      return false;
    }
  }

  return true;
}

export const schemaManager = new SchemaManager();
