/**
 * JTML Type Definitions
 */

export type JTMLType = 'i' | 'f' | 's' | 'b' | 't' | 'n' | 'o' | 'a' | 'e' | 'ref';

export interface JTMLTypeInfo {
  type: JTMLType;
  arrayOf?: JTMLType;
  enumValues?: string[];
  refSchema?: string;
  optional?: boolean;
}

export interface JTMLField {
  name: string;
  typeInfo: JTMLTypeInfo;
}

export interface JTMLSchema {
  id: string;
  fields: JTMLField[];
  version?: string;
}

export interface JTMLEncodeOptions {
  schemaId?: string;
  schemaRef?: string;
  autoInferTypes?: boolean;
  compress?: boolean;
  includeSchema?: boolean;
}

export interface JTMLDecodeOptions {
  schemaCache?: Map<string, JTMLSchema>;
  strict?: boolean;
}

export interface JTMLDocument {
  schema?: JTMLSchema;
  data: unknown;
  metadata?: Record<string, unknown>;
}

export interface TokenStats {
  jsonTokens: number;
  jtmlTokens: number;
  savings: number;
  savingsPercent: number;
}

export type JTMLValue = string | number | boolean | null | JTMLValue[] | { [key: string]: JTMLValue };

/**
 * Type mapping:
 * i - integer
 * f - float
 * s - string
 * b - boolean
 * t - timestamp/datetime
 * n - null
 * o - object
 * a - array
 * e - enum
 * ref - reference to another schema
 */
export const TYPE_MAP: Record<JTMLType, string> = {
  i: 'integer',
  f: 'float',
  s: 'string',
  b: 'boolean',
  t: 'timestamp',
  n: 'null',
  o: 'object',
  a: 'array',
  e: 'enum',
  ref: 'reference'
};

export class JTMLError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'JTMLError';
  }
}
