import { describe, it, expect } from 'vitest';
import { encode, decode, roundTrip, schemaManager } from '../src/index';
import { inferSchema, parseSchema, serializeSchema } from '../src/core/schema';
import { compareTokens } from '../src/utils/tokenizer';

describe('JTML Encoder', () => {
  it('should encode simple array', () => {
    const data = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 }
    ];

    const jtml = encode(data);
    expect(jtml).toContain('@schema');
    expect(jtml).toContain('@data');
    expect(jtml).toContain('1|Alice|30');
    expect(jtml).toContain('2|Bob|25');
  });

  it('should encode with custom schema ID', () => {
    const data = [{ id: 1, name: 'Test' }];
    const jtml = encode(data, { schemaId: 'custom' });
    expect(jtml).toContain('@schema custom');
  });

  it('should handle null values', () => {
    const data = [
      { id: 1, name: 'Alice', email: null },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ];

    const jtml = encode(data);
    expect(jtml).toContain('1|Alice|');
    expect(jtml).toContain('2|Bob|bob@example.com');
  });

  it('should handle boolean values', () => {
    const data = [
      { id: 1, active: true },
      { id: 2, active: false }
    ];

    const jtml = encode(data);
    expect(jtml).toContain('1|1');
    expect(jtml).toContain('2|0');
  });

  it('should handle arrays in values', () => {
    const data = [
      { id: 1, tags: ['javascript', 'typescript'] }
    ];

    const jtml = encode(data);
    expect(jtml).toContain('[javascript,typescript]');
  });

  it('should escape special characters', () => {
    const data = [
      { id: 1, text: 'Line 1\nLine 2' },
      { id: 2, text: 'Has | pipe' }
    ];

    const jtml = encode(data);
    expect(jtml).toContain('\\n');
    expect(jtml).toContain('\\|');
  });
});

describe('JTML Decoder', () => {
  it('should decode simple JTML', () => {
    const jtml = `@schema test
id:i name:s age:i

@data
1|Alice|30
2|Bob|25`;

    const result = decode(jtml) as Array<{ id: number; name: string; age: number }>;
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 1, name: 'Alice', age: 30 });
    expect(result[1]).toEqual({ id: 2, name: 'Bob', age: 25 });
  });

  it('should handle null values', () => {
    const jtml = `@schema test
id:i name:s email:s?

@data
1|Alice|
2|Bob|bob@example.com`;

    const result = decode(jtml) as Array<{ id: number; name: string; email: string | null }>;
    expect(result[0].email).toBeNull();
    expect(result[1].email).toBe('bob@example.com');
  });

  it('should decode booleans', () => {
    const jtml = `@schema test
id:i active:b

@data
1|1
2|0`;

    const result = decode(jtml) as Array<{ id: number; active: boolean }>;
    expect(result[0].active).toBe(true);
    expect(result[1].active).toBe(false);
  });

  it('should unescape special characters', () => {
    const jtml = `@schema test
id:i text:s

@data
1|Line 1\\nLine 2
2|Has \\| pipe`;

    const result = decode(jtml) as Array<{ id: number; text: string }>;
    expect(result[0].text).toBe('Line 1\nLine 2');
    expect(result[1].text).toBe('Has | pipe');
  });
});

describe('Round-trip conversion', () => {
  it('should maintain data integrity', () => {
    const testCases = [
      [{ id: 1, name: 'Alice', age: 30 }],
      [
        { id: 1, active: true },
        { id: 2, active: false }
      ],
      [
        { id: 1, tags: ['a', 'b', 'c'] },
        { id: 2, tags: [] }
      ],
      [
        { id: 1, value: 3.14 },
        { id: 2, value: 2.71 }
      ]
    ];

    testCases.forEach(data => {
      const result = roundTrip(data);
      expect(result.success).toBe(true);
      expect(result.recovered).toEqual(data);
    });
  });
});

describe('Schema Management', () => {
  it('should infer schema correctly', () => {
    const data = [
      { id: 1, name: 'Alice', age: 30, active: true }
    ];

    const schema = inferSchema(data, 'test');
    expect(schema.id).toBe('test');
    expect(schema.fields).toHaveLength(4);
    expect(schema.fields[0].name).toBe('id');
    expect(schema.fields[0].typeInfo.type).toBe('i');
  });

  it('should serialize and parse schema', () => {
    const schema = inferSchema([{ id: 1, name: 'Test' }], 'test');
    const serialized = serializeSchema(schema);
    const parsed = parseSchema(serialized);

    expect(parsed.id).toBe(schema.id);
    expect(parsed.fields).toHaveLength(schema.fields.length);
  });

  it('should cache schemas', () => {
    const schema = inferSchema([{ id: 1 }], 'cached');
    schemaManager.register(schema);

    expect(schemaManager.has('cached')).toBe(true);
    expect(schemaManager.get('cached')).toEqual(schema);
  });
});

describe('Token Efficiency', () => {
  it('should save tokens compared to JSON', () => {
    const data = [
      { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
      { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
      { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35 }
    ];

    const json = JSON.stringify(data);
    const jtml = encode(data);

    const stats = compareTokens(json, jtml);
    
    expect(stats.jtmlTokens).toBeLessThan(stats.jsonTokens);
    expect(stats.savingsPercent).toBeGreaterThan(30);
  });

  it('should show significant savings for large arrays', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50)
    }));

    const json = JSON.stringify(data);
    const jtml = encode(data);

    const stats = compareTokens(json, jtml);
    
    expect(stats.savingsPercent).toBeGreaterThan(50);
  });
});

describe('Real-world API responses', () => {
  it('should handle GitHub API response', () => {
    const githubResponse = {
      id: 1296269,
      name: 'Hello-World',
      full_name: 'octocat/Hello-World',
      private: false,
      description: 'My first repository',
      fork: false,
      created_at: '2011-01-26T19:01:12Z',
      stargazers_count: 80,
      language: 'JavaScript'
    };

    const jtml = encode(githubResponse);
    const decoded = decode(jtml);

    expect(decoded).toEqual(githubResponse);
  });

  it('should handle nested API response', () => {
    const apiResponse = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ],
      metadata: {
        total: 2,
        page: 1
      }
    };

    const jtml = encode(apiResponse.users);
    const decoded = decode(jtml);

    expect(decoded).toEqual(apiResponse.users);
  });
});
