# JTML API Reference

Complete API documentation for @jtml/core v0.1.0

## Table of Contents

- [Encoding](#encoding)
- [Decoding](#decoding)
- [Schema Management](#schema-management)
- [Token Analysis](#token-analysis)
- [Utilities](#utilities)
- [Types](#types)
- [CLI](#cli)

---

## Encoding

### `encode(data, options?)`

Convert JSON data to JTML format.

**Parameters:**
- `data: unknown` - JSON data to encode (object or array)
- `options?: JTMLEncodeOptions` - Optional encoding configuration

**Returns:** `string` - JTML formatted string

**Example:**
```typescript
import { encode } from '@jtml/core';

const users = [{ id: 1, name: 'Alice' }];
const jtml = encode(users);
```

**Options:**
```typescript
interface JTMLEncodeOptions {
  schemaId?: string;          // Custom schema identifier
  schemaRef?: string;         // Reference existing schema
  autoInferTypes?: boolean;   // Auto-detect types (default: true)
  includeSchema?: boolean;    // Include schema in output (default: true)
}
```

---

### `encodeBatch(datasets, schemaId?)`

Encode multiple datasets with a shared schema.

**Parameters:**
- `datasets: unknown[]` - Array of datasets to encode
- `schemaId?: string` - Schema identifier (default: 'batch')

**Returns:** `string` - JTML with shared schema

**Example:**
```typescript
import { encodeBatch } from '@jtml/core';

const datasets = [users, products, orders];
const jtml = encodeBatch(datasets, 'multi_data');
```

---

## Decoding

### `decode(jtml, options?)`

Convert JTML back to JSON.

**Parameters:**
- `jtml: string` - JTML formatted string
- `options?: JTMLDecodeOptions` - Optional decoding configuration

**Returns:** `unknown` - Decoded JSON data

**Example:**
```typescript
import { decode } from '@jtml/core';

const data = decode(jtmlString);
```

**Options:**
```typescript
interface JTMLDecodeOptions {
  schemaCache?: Map<string, JTMLSchema>;  // Pre-loaded schemas
  strict?: boolean;                        // Strict validation (default: true)
}
```

---

## Schema Management

### `inferSchema(data, schemaId)`

Automatically infer schema from data.

**Parameters:**
- `data: unknown` - Data to analyze
- `schemaId: string` - Identifier for the schema

**Returns:** `JTMLSchema` - Inferred schema object

**Example:**
```typescript
import { inferSchema } from '@jtml/core';

const schema = inferSchema(users, 'user_schema');
console.log(schema.fields);
```

---

### `schemaManager`

Singleton for managing schemas across your application.

**Methods:**

#### `register(schema: JTMLSchema): void`
Register a schema for reuse.

#### `get(id: string): JTMLSchema | undefined`
Retrieve a registered schema.

#### `has(id: string): boolean`
Check if schema exists.

#### `clear(): void`
Remove all schemas.

#### `export(): JTMLSchema[]`
Export all schemas.

#### `import(schemas: JTMLSchema[]): void`
Import schemas.

**Example:**
```typescript
import { schemaManager, inferSchema } from '@jtml/core';

const schema = inferSchema(data, 'my_schema');
schemaManager.register(schema);

// Later, reuse the schema
if (schemaManager.has('my_schema')) {
  const schema = schemaManager.get('my_schema');
}
```

---

### `serializeSchema(schema)`

Convert schema object to JTML schema format.

**Parameters:**
- `schema: JTMLSchema` - Schema object to serialize

**Returns:** `string` - JTML schema string

**Example:**
```typescript
import { inferSchema, serializeSchema } from '@jtml/core';

const schema = inferSchema(data, 'test');
const schemaStr = serializeSchema(schema);
// Output: "@schema test\nid:i name:s age:i"
```

---

### `parseSchema(schemaStr)`

Parse JTML schema string into schema object.

**Parameters:**
- `schemaStr: string` - JTML schema string

**Returns:** `JTMLSchema` - Parsed schema object

**Example:**
```typescript
import { parseSchema } from '@jtml/core';

const schemaStr = "@schema users\nid:i name:s";
const schema = parseSchema(schemaStr);
```

---

### `validateAgainstSchema(data, schema)`

Validate data matches schema.

**Parameters:**
- `data: unknown` - Data to validate
- `schema: JTMLSchema` - Schema to validate against

**Returns:** `boolean` - True if valid

**Example:**
```typescript
import { inferSchema, validateAgainstSchema } from '@jtml/core';

const schema = inferSchema(users, 'users');
const isValid = validateAgainstSchema(newData, schema);
```

---

## Token Analysis

### `estimateTokens(text, tokenizer?)`

Estimate token count for text.

**Parameters:**
- `text: string` - Text to analyze
- `tokenizer?: TokenizerType` - Tokenizer to use (default: 'claude')

**Returns:** `number` - Estimated token count

**Example:**
```typescript
import { estimateTokens } from '@jtml/core';

const count = estimateTokens(jsonString, 'gpt');
console.log(`Estimated ${count} tokens`);
```

**Tokenizer Types:** `'gpt' | 'claude' | 'llama'`

---

### `compareTokens(jsonText, jtmlText, tokenizer?)`

Compare token efficiency between JSON and JTML.

**Parameters:**
- `jsonText: string` - JSON formatted text
- `jtmlText: string` - JTML formatted text
- `tokenizer?: TokenizerType` - Tokenizer (default: 'claude')

**Returns:** `TokenStats` - Comparison statistics

**Example:**
```typescript
import { compareTokens } from '@jtml/core';

const stats = compareTokens(jsonStr, jtmlStr);
console.log(`Savings: ${stats.savingsPercent}%`);
```

**TokenStats Interface:**
```typescript
interface TokenStats {
  jsonTokens: number;
  jtmlTokens: number;
  savings: number;
  savingsPercent: number;
}
```

---

### `formatTokenStats(stats)`

Format token stats for display.

**Parameters:**
- `stats: TokenStats` - Statistics to format

**Returns:** `string` - Formatted string

**Example:**
```typescript
import { compareTokens, formatTokenStats } from '@jtml/core';

const stats = compareTokens(json, jtml);
console.log(formatTokenStats(stats));
```

---

### `estimateCostSavings(stats, pricePerMillion?)`

Calculate cost savings based on token reduction.

**Parameters:**
- `stats: TokenStats` - Token statistics
- `pricePerMillion?: number` - Price per million tokens (default: 3.0)

**Returns:** `CostSavings` - Cost analysis

**Example:**
```typescript
import { compareTokens, estimateCostSavings } from '@jtml/core';

const stats = compareTokens(json, jtml);
const cost = estimateCostSavings(stats, 3.0);
console.log(`Save $${cost.costSavedPer1M} per million requests`);
```

**CostSavings Interface:**
```typescript
interface CostSavings {
  tokensSaved: number;
  costSavedPer1M: number;
  costSavedPer1K: number;
}
```

---

### `analyzeTokens(jsonText, jtmlText, tokenizer?)`

Detailed token breakdown analysis.

**Parameters:**
- `jsonText: string` - JSON text
- `jtmlText: string` - JTML text  
- `tokenizer?: TokenizerType` - Tokenizer (default: 'claude')

**Returns:** `DetailedTokenStats` - Detailed breakdown

**Example:**
```typescript
import { analyzeTokens } from '@jtml/core';

const analysis = analyzeTokens(json, jtml);
console.log(analysis.json.structural);  // JSON overhead
console.log(analysis.jtml.schema);      // JTML schema size
```

---

## Utilities

### `jsonToJtml(json, schemaId?)`

One-liner to convert JSON to JTML.

**Parameters:**
- `json: unknown` - JSON data
- `schemaId?: string` - Optional schema ID

**Returns:** `string` - JTML string

**Example:**
```typescript
import { jsonToJtml } from '@jtml/core';

const jtml = jsonToJtml(data);
```

---

### `jtmlToJson(jtml)`

One-liner to convert JTML to JSON.

**Parameters:**
- `jtml: string` - JTML string

**Returns:** `unknown` - JSON data

**Example:**
```typescript
import { jtmlToJson } from '@jtml/core';

const data = jtmlToJson(jtmlString);
```

---

### `convertJsonString(jsonStr, schemaId?)`

Convert JSON string to JTML string.

**Parameters:**
- `jsonStr: string` - JSON formatted string
- `schemaId?: string` - Optional schema ID

**Returns:** `string` - JTML string

**Example:**
```typescript
import { convertJsonString } from '@jtml/core';

const jtml = convertJsonString('{"id":1,"name":"Alice"}');
```

---

### `roundTrip(data)`

Test round-trip conversion (encode → decode).

**Parameters:**
- `data: unknown` - Data to test

**Returns:** `RoundTripResult`

**Example:**
```typescript
import { roundTrip } from '@jtml/core';

const result = roundTrip(myData);
if (result.success) {
  console.log('Perfect round-trip!');
}
```

**RoundTripResult Interface:**
```typescript
interface RoundTripResult {
  success: boolean;
  original: unknown;
  recovered: unknown;
  jtml: string;
}
```

---

## Types

### `JTMLSchema`

Schema definition.

```typescript
interface JTMLSchema {
  id: string;
  fields: JTMLField[];
  version?: string;
}
```

### `JTMLField`

Field in a schema.

```typescript
interface JTMLField {
  name: string;
  typeInfo: JTMLTypeInfo;
}
```

### `JTMLTypeInfo`

Type information for a field.

```typescript
interface JTMLTypeInfo {
  type: JTMLType;
  arrayOf?: JTMLType;
  enumValues?: string[];
  refSchema?: string;
  optional?: boolean;
}
```

### `JTMLType`

Supported data types.

```typescript
type JTMLType = 'i' | 'f' | 's' | 'b' | 't' | 'n' | 'o' | 'a' | 'e' | 'ref';
```

Type meanings:
- `i` - Integer
- `f` - Float
- `s` - String
- `b` - Boolean
- `t` - Timestamp
- `n` - Null
- `o` - Object
- `a` - Array
- `e` - Enum
- `ref` - Reference

---

## CLI

### Installation

```bash
npm install -g @jtml/core
```

### Commands

#### `jtml encode <input> [output]`

Encode JSON file to JTML.

```bash
jtml encode data.json output.jtml
jtml encode data.json  # Output to stdout
```

**Options:**
- `--schema-id <id>` - Set schema identifier
- `--no-schema` - Encode without schema
- `--tokenizer <type>` - Set tokenizer (gpt|claude|llama)

---

#### `jtml decode <input> [output]`

Decode JTML file to JSON.

```bash
jtml decode data.jtml output.json
jtml decode data.jtml  # Output to stdout
```

---

#### `jtml compare <input>`

Compare token efficiency.

```bash
jtml compare large-dataset.json
```

**Options:**
- `--tokenizer <type>` - Set tokenizer for comparison

---

#### `jtml validate <input>`

Validate JTML format.

```bash
jtml validate data.jtml
```

---

#### `jtml schema <input>`

Generate schema only.

```bash
jtml schema api-response.json
```

**Options:**
- `--schema-id <id>` - Set schema identifier

---

## Error Handling

### `JTMLError`

Custom error class for JTML operations.

```typescript
class JTMLError extends Error {
  code: string;
}
```

**Error Codes:**
- `SCHEMA_NOT_FOUND` - Referenced schema doesn't exist
- `SCHEMA_PARSE_ERROR` - Invalid schema format
- `INVALID_DATA` - Data doesn't match expected format
- `TYPE_INFERENCE_ERROR` - Cannot infer type
- `SCHEMA_MISMATCH` - Data doesn't match schema
- `SCHEMA_REQUIRED` - Schema needed but not found

**Example:**
```typescript
import { decode, JTMLError } from '@jtml/core';

try {
  const data = decode(jtml);
} catch (error) {
  if (error instanceof JTMLError) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```

---

## TypeScript Support

All exports are fully typed. Import types:

```typescript
import type {
  JTMLSchema,
  JTMLField,
  JTMLTypeInfo,
  JTMLType,
  JTMLEncodeOptions,
  JTMLDecodeOptions,
  TokenStats,
  CostSavings,
  DetailedTokenStats
} from '@jtml/core';
```

---

## Version Compatibility

- **Node.js**: 16.0.0 or higher
- **TypeScript**: 4.5 or higher (if using TypeScript)
- **Module formats**: ESM and CommonJS

---

For more examples and guides, see the [README](README.md) and [examples/](examples/) directory.
