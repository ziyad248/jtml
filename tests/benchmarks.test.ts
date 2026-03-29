import { encode } from '../src/index';
import { compareTokens, analyzeTokens } from '../src/utils/tokenizer';

console.log('=== JTML Token Efficiency Benchmarks ===\n');

// Benchmark 1: Simple User Array
console.log('Benchmark 1: User Array (10 items)');
const users = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `User${i + 1}`,
  email: `user${i + 1}@example.com`,
  age: 20 + (i % 30),
  active: i % 2 === 0
}));

const usersJson = JSON.stringify(users);
const usersJtml = encode(users);

console.log('JSON:', usersJson.substring(0, 100) + '...');
console.log('JTML:', usersJtml.substring(0, 100) + '...');

const userStats = compareTokens(usersJson, usersJtml);
console.log(`\nTokens - JSON: ${userStats.jsonTokens}, JTML: ${userStats.jtmlTokens}`);
console.log(`Savings: ${userStats.savings} tokens (${userStats.savingsPercent.toFixed(2)}%)\n`);

// Benchmark 2: Product Catalog
console.log('Benchmark 2: Product Catalog (50 items)');
const products = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  sku: `PROD-${1000 + i}`,
  name: `Product ${i + 1}`,
  price: (Math.random() * 1000).toFixed(2),
  stock: Math.floor(Math.random() * 500),
  category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4]
}));

const productsJson = JSON.stringify(products);
const productsJtml = encode(products);

const productStats = compareTokens(productsJson, productsJtml);
console.log(`Tokens - JSON: ${productStats.jsonTokens}, JTML: ${productStats.jtmlTokens}`);
console.log(`Savings: ${productStats.savings} tokens (${productStats.savingsPercent.toFixed(2)}%)\n`);

// Benchmark 3: API Response with Metadata
console.log('Benchmark 3: Paginated API Response');
const apiResponse = {
  data: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: `Article ${i + 1}`,
    author: `Author ${i % 5}`,
    published: `2024-01-${String(i % 28 + 1).padStart(2, '0')}`,
    views: Math.floor(Math.random() * 10000),
    likes: Math.floor(Math.random() * 1000)
  })),
  pagination: {
    page: 1,
    per_page: 25,
    total: 250,
    total_pages: 10
  }
};

const apiJson = JSON.stringify(apiResponse);
const apiJtml = encode(apiResponse.data); // Only encode data array

const apiStats = compareTokens(apiJson, apiJtml);
console.log(`Tokens - JSON: ${apiStats.jsonTokens}, JTML: ${apiStats.jtmlTokens}`);
console.log(`Savings: ${apiStats.savings} tokens (${apiStats.savingsPercent.toFixed(2)}%)\n`);

// Benchmark 4: Large Dataset
console.log('Benchmark 4: Large Dataset (1000 items)');
const largeData = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  timestamp: `2024-03-28T10:${String(i % 60).padStart(2, '0')}:00Z`,
  value: Math.random() * 100,
  status: ['pending', 'completed', 'failed'][i % 3]
}));

const largeJson = JSON.stringify(largeData);
const largeJtml = encode(largeData);

const largeStats = compareTokens(largeJson, largeJtml);
console.log(`Tokens - JSON: ${largeStats.jsonTokens}, JTML: ${largeStats.jtmlTokens}`);
console.log(`Savings: ${largeStats.savings} tokens (${largeStats.savingsPercent.toFixed(2)}%)\n`);

// Detailed Analysis
console.log('=== Detailed Token Analysis ===\n');
const detailedAnalysis = analyzeTokens(usersJson, usersJtml);
console.log('JSON breakdown:');
console.log(`  Total: ${detailedAnalysis.json.total}`);
console.log(`  Structural ({}[]:"): ${detailedAnalysis.json.structural}`);
console.log(`  Keys: ${detailedAnalysis.json.keys}`);
console.log(`  Values: ${detailedAnalysis.json.values}`);

console.log('\nJTML breakdown:');
console.log(`  Total: ${detailedAnalysis.jtml.total}`);
console.log(`  Schema: ${detailedAnalysis.jtml.schema}`);
console.log(`  Data: ${detailedAnalysis.jtml.data}`);
console.log(`  Delimiters: ${detailedAnalysis.jtml.delimiters}`);

// Summary
console.log('\n=== Summary ===\n');
const allStats = [userStats, productStats, apiStats, largeStats];
const avgSavings = allStats.reduce((sum, s) => sum + s.savingsPercent, 0) / allStats.length;

console.log(`Average token savings: ${avgSavings.toFixed(2)}%`);
console.log(`Best case: ${Math.max(...allStats.map(s => s.savingsPercent)).toFixed(2)}%`);
console.log(`Worst case: ${Math.min(...allStats.map(s => s.savingsPercent)).toFixed(2)}%`);

// Cost Savings Estimation
console.log('\n=== Cost Savings (at $3/million tokens) ===\n');
const totalTokensSaved = allStats.reduce((sum, s) => sum + s.savings, 0);
const costSavingsPer1M = (totalTokensSaved / 1_000_000) * 3;

console.log(`Total tokens saved in benchmarks: ${totalTokensSaved.toLocaleString()}`);
console.log(`Estimated cost savings: $${costSavingsPer1M.toFixed(4)} per run`);
console.log(`Annual savings (1M API calls): $${(costSavingsPer1M * 1_000_000).toLocaleString()}`);
