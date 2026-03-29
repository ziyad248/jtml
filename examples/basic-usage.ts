import { encode, decode, compareTokens, formatTokenStats } from '@jtml/core';

// Example 1: Basic Encoding/Decoding
console.log('=== Example 1: Basic Usage ===\n');

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35 }
];

// Encode to JTML
const jtml = encode(users);
console.log('JTML Output:');
console.log(jtml);
console.log();

// Decode back to JSON
const decoded = decode(jtml);
console.log('Decoded Data:');
console.log(JSON.stringify(decoded, null, 2));
console.log();

// Example 2: Token Comparison
console.log('=== Example 2: Token Efficiency ===\n');

const jsonString = JSON.stringify(users);
const stats = compareTokens(jsonString, jtml);

console.log(formatTokenStats(stats));
console.log();

// Example 3: Custom Schema ID
console.log('=== Example 3: Custom Schema ===\n');

const products = [
  { id: 101, name: 'Laptop', price: 999.99, stock: 15 },
  { id: 102, name: 'Mouse', price: 29.99, stock: 100 }
];

const jtmlWithCustomSchema = encode(products, {
  schemaId: 'product_catalog_v1',
  includeSchema: true
});

console.log(jtmlWithCustomSchema);
console.log();

// Example 4: Schema Reuse
console.log('=== Example 4: Schema Reuse ===\n');

const moreProducts = [
  { id: 103, name: 'Keyboard', price: 79.99, stock: 50 },
  { id: 104, name: 'Monitor', price: 299.99, stock: 25 }
];

// Use the same schema reference (saves tokens!)
const jtmlWithRef = encode(moreProducts, {
  schemaRef: 'product_catalog_v1',
  includeSchema: false
});

console.log('With schema reference:');
console.log(jtmlWithRef);
console.log();

// Example 5: Handling Complex Data
console.log('=== Example 5: Complex Data Types ===\n');

const complexData = [
  {
    id: 1,
    name: 'Project Alpha',
    active: true,
    tags: ['urgent', 'backend', 'api'],
    metadata: {
      created: '2024-01-15',
      priority: 'high'
    }
  }
];

const complexJtml = encode(complexData);
console.log(complexJtml);
console.log();

// Example 6: API Integration
console.log('=== Example 6: Real API Response ===\n');

async function fetchAndConvert() {
  // Simulating API response
  const apiResponse = {
    users: [
      { id: 1, username: 'alice123', status: 'active', lastLogin: '2024-03-28T10:30:00Z' },
      { id: 2, username: 'bob456', status: 'inactive', lastLogin: '2024-03-20T15:45:00Z' }
    ],
    metadata: {
      total: 2,
      page: 1,
      per_page: 10
    }
  };

  // Convert only the data array
  const jtml = encode(apiResponse.users, {
    schemaId: 'api_users_response'
  });

  console.log('Original JSON size:', JSON.stringify(apiResponse.users).length, 'bytes');
  console.log('JTML size:', jtml.length, 'bytes');
  console.log('Compression:', (
    ((JSON.stringify(apiResponse.users).length - jtml.length) / 
    JSON.stringify(apiResponse.users).length) * 100
  ).toFixed(2) + '%');
  console.log();
  console.log('JTML Output:');
  console.log(jtml);
}

fetchAndConvert();
