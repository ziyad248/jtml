# Contributing to JTML

Thank you for your interest in contributing to JTML! This document provides guidelines for contributing.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/thushanthbengre22-dev/jtml.git
cd jtml

# Install dependencies
npm install

# Run tests
npm test

# Run benchmarks
npm run benchmark

# Build the project
npm run build
```

## Project Structure

```
jtml/
├── src/
│   ├── core/          # Core encoder/decoder logic
│   ├── utils/         # Utility functions
│   ├── index.ts       # Main exports
│   └── cli.ts         # CLI tool
├── tests/             # Test files
├── examples/          # Usage examples
└── README.md
```

## Code Style

- Use TypeScript
- Follow existing code formatting (Prettier)
- Add JSDoc comments for public APIs
- Keep functions focused and testable

## Testing

All new features should include tests:

```typescript
import { describe, it, expect } from 'vitest';
import { encode, decode } from '../src/index';

describe('New Feature', () => {
  it('should work correctly', () => {
    const result = encode(data);
    expect(result).toBe(expected);
  });
});
```

Run tests:
```bash
npm test
npm run test:coverage
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests
5. Run tests and benchmarks
6. Commit (`git commit -m 'Add amazing feature'`)
7. Push to your fork (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Pull Request Guidelines

- Provide a clear description of the problem and solution
- Include relevant issue numbers
- Add tests for new features
- Update documentation if needed
- Ensure all tests pass
- Keep commits focused and well-described

## Reporting Issues

When reporting issues, please include:

- JTML version
- Node.js version
- Example code that reproduces the issue
- Expected vs actual behavior
- Any error messages

## Feature Requests

We welcome feature requests! Please:

- Check existing issues first
- Clearly describe the use case
- Explain why it would be useful
- Provide examples if possible

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## Questions?

Feel free to open a discussion on GitHub Issues or Discussions.

Thank you for contributing to JTML!
