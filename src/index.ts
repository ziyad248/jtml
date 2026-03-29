/**
 * JTML - JSON Token-Minimized Language
 * Ultra-compact serialization format optimized for LLM token efficiency
 */

// Core functionality
import { encode } from './core/encoder';
import { decode } from './core/decoder';
import { schemaManager } from './core/schema';
import { estimateTokens, compareTokens } from './utils/tokenizer';

export { JTMLEncoder, encoder, encode, encodeBatch } from './core/encoder';
export { JTMLDecoder, decoder, decode } from './core/decoder';

// Schema management
export {
  SchemaManager,
  schemaManager,
  inferType,
  inferSchema,
  serializeSchema,
  parseSchema,
  validateAgainstSchema
} from './core/schema';

// Types
export type {
  JTMLType,
  JTMLTypeInfo,
  JTMLField,
  JTMLSchema,
  JTMLEncodeOptions,
  JTMLDecodeOptions,
  JTMLDocument,
  TokenStats,
  JTMLValue
} from './core/types';

export { JTMLError, TYPE_MAP } from './core/types';

// Utilities
export {
  estimateTokens,
  compareTokens,
  calculateEfficiency,
  analyzeTokens,
  formatTokenStats,
  estimateCostSavings
} from './utils/tokenizer';

export type {
  TokenizerType,
  DetailedTokenStats,
  CostSavings
} from './utils/tokenizer';

/**
 * Quick conversion utilities
 */

/**
 * Convert JSON to JTML (one-liner)
 */
export function jsonToJtml(json: unknown, schemaId?: string): string {
  return encode(json, { schemaId, autoInferTypes: true });
}

/**
 * Convert JTML to JSON (one-liner)
 */
export function jtmlToJson(jtml: string): unknown {
  return decode(jtml);
}

/**
 * Convert JSON string to JTML string
 */
export function convertJsonString(jsonStr: string, schemaId?: string): string {
  const data = JSON.parse(jsonStr);
  return jsonToJtml(data, schemaId);
}

/**
 * Round-trip conversion test
 */
export function roundTrip(data: unknown): { 
  success: boolean; 
  original: unknown; 
  recovered: unknown;
  jtml: string;
} {
  const jtml = encode(data);
  const recovered = decode(jtml);
  
  return {
    success: JSON.stringify(data) === JSON.stringify(recovered),
    original: data,
    recovered,
    jtml
  };
}

// Default export
export default {
  encode,
  decode,
  jsonToJtml,
  jtmlToJson,
  convertJsonString,
  roundTrip,
  schemaManager,
  estimateTokens,
  compareTokens
};
