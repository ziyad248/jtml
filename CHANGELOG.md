# Changelog

All notable changes to JTML will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-28

### Added
- Initial release of JTML (JSON Token-Minimized Language)
- Core encoding functionality (JSON → JTML)
- Core decoding functionality (JTML → JSON)
- Automatic schema inference from data
- Schema management and caching
- Schema reuse for multi-dataset encoding
- Token counting utilities for GPT, Claude, and Llama
- Token comparison and cost analysis
- CLI tool with encode, decode, compare, validate, and schema commands
- Full TypeScript support with type definitions
- Comprehensive test suite (18 tests)
- Performance benchmarks
- Examples for basic usage and LLM integration
- Support for all JSON types (primitives, arrays, objects, null)
- Optional field support
- Special character escaping
- Round-trip conversion testing
- Batch encoding with shared schemas
- Zero runtime dependencies

### Features by Category

#### Core Encoding/Decoding
- Auto-infer types from data
- Schema-first encoding (eliminates key repetition)
- Positional value encoding
- Support for nested structures
- Metadata encoding

#### Schema Management
- Schema inference
- Schema serialization/parsing
- Schema validation
- Schema caching and reuse
- Schema versioning support

#### Analysis & Optimization
- Token estimation for multiple tokenizers
- Token comparison (JSON vs JTML)
- Detailed token breakdown
- Cost savings calculation
- Efficiency metrics

#### Developer Experience  
- Full TypeScript support
- Comprehensive API documentation
- CLI tool for command-line usage
- Clear error messages with error codes
- Examples and tutorials

### Performance
- Average 60% token savings vs JSON
- ~55% character compression
- Fast encoding/decoding (comparable to JSON.parse)
- Low schema overhead (10-15 tokens)

### Documentation
- Complete README with examples
- API reference documentation
- Contributing guidelines
- Deployment guide
- Project summary
- Code of conduct

---

## Security

No known security issues. Please report any findings via [GitHub Issues](https://github.com/thushanthbengre22-dev/jtml/issues).

---

[Unreleased]: https://github.com/thushanthbengre22-dev/jtml/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/thushanthbengre22-dev/jtml/releases/tag/v0.1.0
