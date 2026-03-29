# JTML

**JSON Token-Minimized Language — schema-first encoding for token-efficient LLM prompts**

[![npm version](https://badge.fury.io/js/%40jtml%2Fcore.svg)](https://www.npmjs.com/package/@jtml/core)
[![CI](https://github.com/thushanthbengre22-dev/jtml/actions/workflows/test.yml/badge.svg)](https://github.com/thushanthbengre22-dev/jtml/actions/workflows/test.yml)
[![npm downloads](https://img.shields.io/npm/dm/@jtml/core.svg)](https://www.npmjs.com/package/@jtml/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why JTML?

When feeding structured data to an LLM, JSON's repeated key names consume tokens on every row. For large API responses, this overhead is significant.

JTML declares the schema once and encodes values positionally — reducing token usage by ~60% on typical structured datasets.

```
JSON (287 tokens)                        JTML (109 tokens — 62% fewer)
─────────────────────────────────────    ──────────────────────────────
[                                        @schema users
  {"id":1,"name":"Alice",                id:i name:s email:s age:i active:b
   "email":"alice@example.com",
   "age":30,"active":true},              @data
  {"id":2,"name":"Bob",                  @array
   "email":"bob@example.com",            1|Alice|alice@example.com|30|1
   "age":25,"active":false}              2|Bob|bob@example.com|25|0
]
```

---

## Installation

```bash
npm install @jtml/core
```

---

## Quick Start

```typescript
import { encode, decode, compareTokens } from '@jtml/core';

const users = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 }
];

// Encode to JTML
const jtml = encode(users);

// Decode back to JSON
const decoded = decode(jtml);

// Measure token savings
const stats = compareTokens(JSON.stringify(users), jtml);
console.log(`Saved ${stats.savings} tokens (${stats.savingsPercent.toFixed(1)}%)`);
```

---

## Use Cases

### Compress API responses before sending to an LLM

```typescript
const response = await fetch('https://api.example.com/products?limit=500');
const products = await response.json();

// Include compressed data in the prompt
const jtml = encode(products);
const prompt = `Analyze these products and identify trends:\n\n${jtml}`;
```

### Fit more data in a fixed context window

```typescript
// Encode a large history with a named schema
const historyJtml = encode(orderHistory, { schemaId: 'orders' });

// Reference the same schema for current data — no schema overhead on second call
const currentJtml = encode(currentOrders, { schemaRef: 'orders', includeSchema: false });
```

### Validate JTML output before using it

```typescript
import { decode, JTMLError } from '@jtml/core';

try {
  const data = decode(jtmlString);
} catch (error) {
  if (error instanceof JTMLError) {
    console.error(`${error.code}: ${error.message}`);
  }
}
```

---

## API

### `encode(data, options?)`

Converts JSON data to JTML format.

```typescript
import { encode } from '@jtml/core';

// Auto-infer schema
const jtml = encode(data);

// Custom schema ID
const jtml = encode(data, { schemaId: 'products_v1' });

// Reference an existing schema — omits schema block from output
const jtml = encode(data, { schemaRef: 'products_v1', includeSchema: false });
```

**Options:**

```typescript
interface JTMLEncodeOptions {
  schemaId?: string;        // Schema identifier (default: 'default')
  schemaRef?: string;       // Reference an already-registered schema
  autoInferTypes?: boolean; // Infer types from data (default: true)
  includeSchema?: boolean;  // Include schema block in output (default: true)
}
```

---

### `decode(jtml, options?)`

Converts JTML back to JSON with type reconstruction.

```typescript
import { decode } from '@jtml/core';

// Basic decode
const result = decode(jtmlString);

// With pre-loaded schema cache
const cached = decode(jtmlString, { schemaCache: mySchemaCache });
```

**Options:**

```typescript
interface JTMLDecodeOptions {
  schemaCache?: Map<string, JTMLSchema>; // Pre-registered schemas
  strict?: boolean;                       // Require schema (default: true)
}
```

---

### `encodeBatch(datasets, schemaId?)`

Encodes multiple datasets under a shared schema.

```typescript
import { encodeBatch } from '@jtml/core';

const jtml = encodeBatch([users, products, orders], 'batch_v1');
```

---

### Token Analysis

```typescript
import { compareTokens, formatTokenStats, estimateCostSavings } from '@jtml/core';

const stats = compareTokens(jsonString, jtmlString);
console.log(formatTokenStats(stats));
// Token Comparison:
//   JSON:    287 tokens
//   JTML:    109 tokens
//   Savings: 178 tokens (62.0%)

const cost = estimateCostSavings(stats, 3.0); // $3 per million tokens
console.log(`$${cost.costSavedPer1M.toFixed(4)} saved per million requests`);
```

**Tokenizer options:** `'claude'` (default) | `'gpt'` | `'llama'`

---

### Schema Management

```typescript
import { schemaManager, inferSchema } from '@jtml/core';

const schema = inferSchema(data, 'my_schema');
schemaManager.register(schema);

// Reuse across requests
const jtml = encode(newData, { schemaRef: 'my_schema' });
```

---

## Format Specification

### Type Markers

| Marker | Type      | Encoded as               |
|--------|-----------|--------------------------|
| `i`    | Integer   | `42`                     |
| `f`    | Float     | `3.14`                   |
| `s`    | String    | `hello`                  |
| `b`    | Boolean   | `1` (true) / `0` (false) |
| `t`    | Timestamp | `2026-03-29T10:30:00Z`   |
| `n`    | Null      | `` (empty)               |
| `a`    | Array     | `[1,2,3]`                |
| `o`    | Object    | `{key:value}`            |

### Schema Definition

```
@schema user_profile
id:i name:s email:s age:i? active:b tags:s[]

@data
@array
1|Alice|alice@example.com|30|1|[admin,user]
2|Bob|bob@example.com||0|[user]
```

### Optional Fields

```
@schema product
id:i name:s price:f description:s?

@data
@array
101|Laptop|999.99|High-performance laptop
102|Mouse|29.99|
```

### Schema Reuse

```
@ref user_profile

@data
@array
3|Charlie|charlie@example.com|35|1|[moderator]
```

### Special Characters

| Character | Escaped as |
|-----------|------------|
| `\|`      | `\\|`      |
| newline   | `\\n`      |
| `\\`      | `\\\\`     |

---

## CLI

```bash
# Install globally
npm install -g @jtml/core

# Encode JSON to JTML
jtml encode input.json output.jtml

# Decode JTML to JSON
jtml decode input.jtml output.json

# Compare token efficiency
jtml compare dataset.json

# Generate schema only
jtml schema api-response.json

# Validate JTML format
jtml validate data.jtml
```

**Options:**

```bash
jtml encode data.json --schema-id "products_v1"
jtml encode data.json --no-schema
jtml compare data.json --tokenizer gpt
```

---

## Benchmarks

Measured on real structured datasets. Token counts are estimates based on approximate tokenization.

| Dataset              | JSON tokens | JTML tokens | Savings |
|----------------------|-------------|-------------|---------|
| User array (10)      | 287         | 109         | 62%     |
| Product catalog (50) | 1,853       | 638         | 66%     |
| Paginated API (25)   | 967         | 337         | 65%     |
| Large dataset (1000) | 33,064      | 15,953      | 52%     |

Average savings: **~61%**

---

## Cost Savings

At **$3 per million input tokens** (approximate Claude Sonnet pricing):

| Requests/day | JSON cost/day | JTML cost/day | Daily savings |
|--------------|---------------|---------------|---------------|
| 1,000        | $0.86         | $0.33         | $0.53         |
| 10,000       | $8.60         | $3.30         | $5.30         |
| 100,000      | $86.00        | $33.00        | $53.00        |


*Assumes 287-token average JSON payload per request. Actual savings vary by dataset.*

---

## TypeScript Support

All exports are fully typed. Import types directly:

```typescript
import type {
  JTMLSchema,
  JTMLField,
  JTMLTypeInfo,
  JTMLType,
  JTMLEncodeOptions,
  JTMLDecodeOptions,
  TokenStats,
  CostSavings
} from '@jtml/core';
```

---

## Error Handling

```typescript
import { JTMLError } from '@jtml/core';

try {
  const data = decode(jtmlString);
} catch (error) {
  if (error instanceof JTMLError) {
    // error.code: SCHEMA_NOT_FOUND | SCHEMA_PARSE_ERROR | SCHEMA_MISMATCH
    //             SCHEMA_REQUIRED | INVALID_DATA | INVALID_VALUE
    console.error(`${error.code}: ${error.message}`);
  }
}
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE)