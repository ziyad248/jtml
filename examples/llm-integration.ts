import { encode, decode, compareTokens } from '@jtml/core';

/**
 * Example: Using JTML with LLM APIs to reduce token costs
 * This demonstrates how to convert API responses to JTML before sending to LLMs
 */

// Simulated API response with lots of repeated keys
const ecommerceOrders = [
  {
    orderId: '12345',
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    orderDate: '2024-03-28T10:30:00Z',
    totalAmount: 299.99,
    status: 'shipped',
    items: [
      { productId: 'P001', name: 'Laptop', quantity: 1, price: 999.99 },
      { productId: 'P002', name: 'Mouse', quantity: 2, price: 29.99 }
    ]
  },
  {
    orderId: '12346',
    customerName: 'Bob Smith',
    customerEmail: 'bob@example.com',
    orderDate: '2024-03-28T11:15:00Z',
    totalAmount: 159.97,
    status: 'pending',
    items: [
      { productId: 'P003', name: 'Keyboard', quantity: 1, price: 79.99 },
      { productId: 'P004', name: 'Webcam', quantity: 1, price: 79.98 }
    ]
  },
  // ... imagine 100 more orders
];

console.log('=== LLM Integration Example ===\n');

// Traditional approach: Send full JSON to LLM
const traditionalPrompt = `
Analyze these e-commerce orders and provide insights:

${JSON.stringify(ecommerceOrders, null, 2)}

Please identify:
1. Total revenue
2. Most common products
3. Order status distribution
`;

// JTML approach: Convert to compact format first
const ordersJtml = encode(ecommerceOrders, { schemaId: 'ecommerce_orders' });

const jtmlPrompt = `
Analyze these e-commerce orders (in JTML format) and provide insights:

${ordersJtml}

Please identify:
1. Total revenue
2. Most common products
3. Order status distribution
`;

console.log('Traditional JSON approach:');
console.log('Prompt length:', traditionalPrompt.length, 'chars');

console.log('\nJTML approach:');
console.log('Prompt length:', jtmlPrompt.length, 'chars');

const stats = compareTokens(traditionalPrompt, jtmlPrompt);
console.log('\nToken comparison:');
console.log(`  JSON tokens: ${stats.jsonTokens}`);
console.log(`  JTML tokens: ${stats.jtmlTokens}`);
console.log(`  Savings: ${stats.savings} tokens (${stats.savingsPercent.toFixed(2)}%)`);

console.log('\n=== Cost Impact ===');
const costPerMillionTokens = 3.0; // Claude Sonnet pricing
const costSavingsPerRequest = (stats.savings / 1_000_000) * costPerMillionTokens;
const requestsPerMonth = 10_000;
const monthlySavings = costSavingsPerRequest * requestsPerMonth;

console.log(`Cost per request saved: $${costSavingsPerRequest.toFixed(6)}`);
console.log(`Monthly savings (${requestsPerMonth.toLocaleString()} requests): $${monthlySavings.toFixed(2)}`);
console.log(`Annual savings: $${(monthlySavings * 12).toFixed(2)}`);

// Example: Streaming large datasets to LLM
console.log('\n=== Streaming Example ===\n');

async function streamOrdersToLLM(orders: typeof ecommerceOrders) {
  // Convert to JTML
  const jtml = encode(orders);
  
  // In a real implementation, you'd send this to your LLM
  console.log('Sending to LLM:');
  console.log(jtml.substring(0, 200) + '...\n');
  
  // Simulate LLM response (would be actual API call)
  const llmResponse = `
Based on the JTML data:
1. Total Revenue: $459.96
2. Most Common Product: Mouse (2 units)
3. Status Distribution: 1 shipped, 1 pending
  `;
  
  return llmResponse;
}

streamOrdersToLLM(ecommerceOrders).then(response => {
  console.log('LLM Analysis Result:');
  console.log(response);
});

// Example: Using JTML for long-term context
console.log('\n=== Context Window Optimization ===\n');

function analyzeWithContext(currentOrders: typeof ecommerceOrders, historicalOrders: typeof ecommerceOrders) {
  // Convert both to JTML to save context window space
  const currentJtml = encode(currentOrders, { schemaId: 'current_orders' });
  const historicalJtml = encode(historicalOrders, { schemaRef: 'current_orders' }); // Reuse schema!
  
  const contextPrompt = `
Historical orders (JTML):
${historicalJtml}

Current orders (JTML):
${currentJtml}

Compare current orders to historical patterns.
  `;
  
  console.log('Context-aware prompt size:', contextPrompt.length, 'chars');
  
  // Calculate token savings vs JSON
  const jsonVersion = `
Historical orders:
${JSON.stringify(historicalOrders)}

Current orders:
${JSON.stringify(currentOrders)}

Compare current orders to historical patterns.
  `;
  
  const contextStats = compareTokens(jsonVersion, contextPrompt);
  console.log(`Token savings: ${contextStats.savings} (${contextStats.savingsPercent.toFixed(2)}%)`);
  console.log('This allows fitting more context in the same window!');
}

analyzeWithContext(ecommerceOrders, ecommerceOrders);
