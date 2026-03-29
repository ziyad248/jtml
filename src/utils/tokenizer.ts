import type { TokenStats } from '../core/types';

/**
 * Approximate token counting for different tokenizers
 * Based on heuristics - for exact counts, use actual tokenizer libraries
 */

export type TokenizerType = 'gpt' | 'claude' | 'llama';

/**
 * Estimate token count using simple heuristics
 * GPT/Claude: ~4 chars per token average
 * More accurate for estimation than character count
 */
export function estimateTokens(text: string, tokenizer: TokenizerType = 'claude'): number {
  // Remove extra whitespace
  const normalized = text.trim().replace(/\s+/g, ' ');

  // Different tokenizers have different characteristics
  const charsPerToken: Record<TokenizerType, number> = {
    gpt: 4,
    claude: 3.8,
    llama: 4.2
  };

  const ratio = charsPerToken[tokenizer];

  // Base estimate
  let estimate = normalized.length / ratio;

  // Adjust for common patterns
  
  // JSON structural tokens (braces, brackets, quotes, colons, commas)
  const structuralChars = (normalized.match(/[{}[\]":,]/g) || []).length;
  estimate += structuralChars * 0.3; // Structural chars often tokenize separately

  // Numbers and special formatting
  const numbers = (normalized.match(/\d+/g) || []).length;
  estimate += numbers * 0.2; // Numbers can be multi-token

  return Math.ceil(estimate);
}

/**
 * Compare token efficiency between JSON and JTML
 */
export function compareTokens(
  jsonText: string,
  jtmlText: string,
  tokenizer: TokenizerType = 'claude'
): TokenStats {
  const jsonTokens = estimateTokens(jsonText, tokenizer);
  const jtmlTokens = estimateTokens(jtmlText, tokenizer);
  const savings = jsonTokens - jtmlTokens;
  const savingsPercent = jsonTokens > 0 ? (savings / jsonTokens) * 100 : 0;

  return {
    jsonTokens,
    jtmlTokens,
    savings,
    savingsPercent
  };
}

/**
 * Calculate token efficiency ratio
 */
export function calculateEfficiency(jsonText: string, jtmlText: string): number {
  const jsonLen = jsonText.length;
  const jtmlLen = jtmlText.length;
  
  return ((jsonLen - jtmlLen) / jsonLen) * 100;
}

/**
 * Detailed token analysis
 */
export interface DetailedTokenStats {
  json: {
    total: number;
    structural: number; // {}, [], :, ", ,
    keys: number;
    values: number;
  };
  jtml: {
    total: number;
    schema: number;
    data: number;
    delimiters: number;
  };
  comparison: TokenStats;
}

export function analyzeTokens(
  jsonText: string,
  jtmlText: string,
  tokenizer: TokenizerType = 'claude'
): DetailedTokenStats {
  // JSON analysis
  const jsonStructural = (jsonText.match(/[{}[\]":,]/g) || []).length;
  const jsonKeys = (jsonText.match(/"(\w+)":/g) || []).length;
  
  // JTML analysis
  const jtmlSchema = jtmlText.split('@data')[0] || '';
  const jtmlData = jtmlText.split('@data')[1] || '';
  const jtmlDelimiters = (jtmlText.match(/[|:]/g) || []).length;

  return {
    json: {
      total: estimateTokens(jsonText, tokenizer),
      structural: Math.ceil(jsonStructural * 0.8),
      keys: Math.ceil(jsonKeys * 1.5), // Keys with quotes
      values: estimateTokens(jsonText, tokenizer) - Math.ceil(jsonStructural * 0.8) - Math.ceil(jsonKeys * 1.5)
    },
    jtml: {
      total: estimateTokens(jtmlText, tokenizer),
      schema: estimateTokens(jtmlSchema, tokenizer),
      data: estimateTokens(jtmlData, tokenizer),
      delimiters: Math.ceil(jtmlDelimiters * 0.5)
    },
    comparison: compareTokens(jsonText, jtmlText, tokenizer)
  };
}

/**
 * Format token stats for display
 */
export function formatTokenStats(stats: TokenStats): string {
  return `
Token Comparison:
  JSON:    ${stats.jsonTokens} tokens
  JTML:    ${stats.jtmlTokens} tokens
  Savings: ${stats.savings} tokens (${stats.savingsPercent.toFixed(2)}%)
  `.trim();
}

/**
 * Estimate cost savings (based on typical LLM pricing)
 */
export interface CostSavings {
  tokensSaved: number;
  costSavedPer1M: number; // USD
  costSavedPer1K: number; // USD
}

export function estimateCostSavings(
  stats: TokenStats,
  pricePerMillion: number = 3.0 // Default: ~$3 per million tokens (Claude Sonnet)
): CostSavings {
  const costSavedPer1M = (stats.savings / 1_000_000) * pricePerMillion;
  const costSavedPer1K = (stats.savings / 1_000) * (pricePerMillion / 1_000);

  return {
    tokensSaved: stats.savings,
    costSavedPer1M,
    costSavedPer1K
  };
}
