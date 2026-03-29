# JTML - Deployment Guide

## 📦 Publishing to npm

### Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm authentication**: 
   ```bash
   npm login
   ```

### Pre-publish Checklist

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG.md updated
- [ ] README.md is current
- [ ] Examples work correctly

### Publishing Steps

```bash
# 1. Ensure you're on main branch and up to date
git checkout main
git pull origin main

# 2. Run all tests
npm test

# 3. Build the package
npm run build

# 4. Check what will be published (dry run)
npm publish --dry-run

# 5. Publish to npm (if everything looks good)
npm publish --access public

# 6. Tag the release
git tag v0.1.0
git push origin v0.1.0
```

### Version Bumping

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

## 🚀 GitHub Setup

### 1. Create Repository

```bash
# Initialize git (if not already done)
cd jtml
git init

# Add remote
git remote add origin https://github.com/thushanthbengre22-dev/jtml.git

# Initial commit
git add .
git commit -m "Initial commit: JTML v0.1.0"
git push -u origin main
```

### 2. Repository Settings

- **Description**: "Ultra-compact JSON serialization optimized for LLM token efficiency"
- **Topics**: `json`, `llm`, `tokens`, `compression`, `ai`, `typescript`, `serialization`
- **Enable Issues**: Yes
- **Enable Discussions**: Yes
- **Enable Wiki**: Optional

### 3. Create Release

1. Go to Releases → Create new release
2. Tag version: `v0.1.0`
3. Release title: `JTML v0.1.0 - Initial Release`
4. Description:
   ```markdown
   ## 🎉 First Release of JTML
   
   JSON Token-Minimized Language - reduce LLM token costs by ~60%!
   
   ### Features
   - ✅ JSON to JTML encoding with schema inference
   - ✅ JTML to JSON decoding
   - ✅ Schema caching and reuse
   - ✅ Token counting utilities
   - ✅ CLI tool
   - ✅ TypeScript support
   
   ### Installation
   ```bash
   npm install @jtml/core
   ```
   
   ### Quick Start
   ```typescript
   import { encode, decode } from '@jtml/core';
   
   const jtml = encode(jsonData);
   const data = decode(jtml);
   ```
   
   See [README](https://github.com/thushanthbengre22-dev/jtml#readme) for full documentation.
   ```

## 📊 npm Package Settings

### package.json Updates

Ensure these fields are correct:

```json
{
  "name": "@jtml/core",
  "version": "0.1.0",
  "description": "JSON Token-Minimized Language - Ultra-compact serialization format optimized for LLM token efficiency",
  "author": "Thushanth Bengre <thushanthbengre22@gmail.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/thushanthbengre22-dev/jtml.git"
  },
  "bugs": {
    "url": "https://github.com/thushanthbengre22-dev/jtml/issues"
  },
  "homepage": "https://github.com/thushanthbengre22-dev/jtml#readme",
  "keywords": [
    "json",
    "serialization",
    "llm",
    "tokens",
    "compression",
    "ai",
    "language-model",
    "optimization",
    "typescript"
  ]
}
```

## 🎯 Marketing & Promotion

### 1. npm Package Page

Your package will be at: `https://www.npmjs.com/package/@jtml/core`

### 2. GitHub README Badge

Add to top of README.md:
```markdown
[![npm version](https://badge.fury.io/js/%40jtml%2Fcore.svg)](https://www.npmjs.com/package/@jtml/core)
[![Downloads](https://img.shields.io/npm/dm/@jtml/core.svg)](https://www.npmjs.com/package/@jtml/core)
[![License](https://img.shields.io/npm/l/@jtml/core.svg)](https://github.com/thushanthbengre22-dev/jtml/blob/main/LICENSE)
```

### 3. Share On

- [ ] Twitter/X
- [ ] LinkedIn
- [ ] Hacker News
- [ ] Reddit (r/MachineLearning, r/typescript, r/node)
- [ ] Dev.to
- [ ] Medium

### Sample Social Post

```
🚀 Just released JTML - a new serialization format that reduces LLM token costs by ~60%!

If you're sending JSON to GPT-4, Claude, or other LLMs, you're wasting tokens (and money) on repeated keys.

JTML uses schema-first encoding to compress data while staying LLM-friendly.

✅ 60% fewer tokens
✅ TypeScript support
✅ CLI tool included
✅ Zero dependencies

npm install @jtml/core

#AI #LLM #TypeScript #OpenSource
```

## 🔧 Continuous Integration (Optional)

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### Publish Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📈 Post-Launch

### Monitor

- npm download stats
- GitHub stars/forks
- Issues and PRs
- Community feedback

### Iterate

- Address bugs quickly
- Consider feature requests
- Keep dependencies updated
- Improve documentation based on questions

## Next Steps

1. **Build community**: Respond to issues, welcome contributors
2. **Integrations**: Examples with popular LLM libraries (LangChain, LlamaIndex)
3. **Performance**: Continuous optimization
4. **Extensions**: Browser version, streaming support, etc.
