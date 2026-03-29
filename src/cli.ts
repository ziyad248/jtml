#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { encode, decode, compareTokens, formatTokenStats } from './index';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`
JTML - JSON Token-Minimized Language

Usage:
  jtml encode <input.json> [output.jtml]   Convert JSON to JTML
  jtml decode <input.jtml> [output.json]   Convert JTML to JSON
  jtml compare <input.json>                Compare token efficiency
  jtml validate <input.jtml>               Validate JTML format
  jtml schema <input.json>                 Generate schema only

Options:
  -h, --help                               Show this help message
  -v, --version                            Show version
  --schema-id <id>                         Set schema ID
  --no-schema                              Encode without schema
  --tokenizer <gpt|claude|llama>           Set tokenizer for comparison

Examples:
  jtml encode api-response.json            # Output to stdout
  jtml encode data.json output.jtml        # Save to file
  jtml decode data.jtml                    # Output to stdout
  jtml compare large-api.json              # Show token savings
  `);
}

function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

function main() {
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log(`jtml v${getVersion()}`);
    process.exit(0);
  }

  const command = args[0];
  const inputFile = args[1];
  const outputFile = args[2];

  // Get options
  const schemaIdIndex = args.indexOf('--schema-id');
  const schemaId = schemaIdIndex >= 0 ? args[schemaIdIndex + 1] : undefined;
  const noSchema = args.includes('--no-schema');
  const tokenizerIndex = args.indexOf('--tokenizer');
  const tokenizer = tokenizerIndex >= 0 
    ? args[tokenizerIndex + 1] as 'gpt' | 'claude' | 'llama'
    : 'claude';

  try {
    switch (command) {
      case 'encode': {
        if (!inputFile) {
          console.error('Error: Input file required');
          printUsage();
          process.exit(1);
        }

        const jsonText = readFileSync(inputFile, 'utf-8');
        const data = JSON.parse(jsonText);
        
        const jtml = encode(data, {
          schemaId,
          includeSchema: !noSchema,
          autoInferTypes: true
        });

        if (outputFile) {
          writeFileSync(outputFile, jtml, 'utf-8');
          console.log(`✓ Encoded to ${outputFile}`);
          
          // Show stats
          const stats = compareTokens(jsonText, jtml, tokenizer);
          console.log(formatTokenStats(stats));
        } else {
          console.log(jtml);
        }
        break;
      }

      case 'decode': {
        if (!inputFile) {
          console.error('Error: Input file required');
          printUsage();
          process.exit(1);
        }

        const jtml = readFileSync(inputFile, 'utf-8');
        const data = decode(jtml);
        const jsonText = JSON.stringify(data, null, 2);

        if (outputFile) {
          writeFileSync(outputFile, jsonText, 'utf-8');
          console.log(`✓ Decoded to ${outputFile}`);
        } else {
          console.log(jsonText);
        }
        break;
      }

      case 'compare': {
        if (!inputFile) {
          console.error('Error: Input file required');
          printUsage();
          process.exit(1);
        }

        const jsonText = readFileSync(inputFile, 'utf-8');
        const data = JSON.parse(jsonText);
        const jtml = encode(data);

        const stats = compareTokens(jsonText, jtml, tokenizer);
        
        console.log('\n=== Token Efficiency Comparison ===\n');
        console.log(formatTokenStats(stats));
        console.log(`\nTokenizer: ${tokenizer}`);
        console.log(`JSON size: ${jsonText.length} chars`);
        console.log(`JTML size: ${jtml.length} chars`);
        console.log(`Compression: ${(((jsonText.length - jtml.length) / jsonText.length) * 100).toFixed(2)}%`);
        break;
      }

      case 'validate': {
        if (!inputFile) {
          console.error('Error: Input file required');
          printUsage();
          process.exit(1);
        }

        const jtml = readFileSync(inputFile, 'utf-8');
        
        try {
          decode(jtml);
          console.log('✓ Valid JTML format');
        } catch (error) {
          console.error('✗ Invalid JTML format');
          if (error instanceof Error) {
            console.error(`  ${error.message}`);
          }
          process.exit(1);
        }
        break;
      }

      case 'schema': {
        if (!inputFile) {
          console.error('Error: Input file required');
          printUsage();
          process.exit(1);
        }

        const jsonText = readFileSync(inputFile, 'utf-8');
        const data = JSON.parse(jsonText);
        
        const jtml = encode(data, { 
          schemaId: schemaId || 'generated',
          includeSchema: true 
        });
        
        // Extract just the schema part
        const schemaOnly = jtml.split('@data')[0].trim();
        console.log(schemaOnly);
        break;
      }

      default:
        console.error(`Error: Unknown command '${command}'`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
