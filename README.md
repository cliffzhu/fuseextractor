# Fuse Extractor

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/?url=https://github.com/cliffzhu/fuse-extractor)](https://deploy.workers.cloudflare.com/?url=https://github.com/cliffzhu/fuse-extractor)

A Cloudflare Workers service for intelligent keyword extraction with fuzzy synonym matching powered by [fuse.js](https://fusejs.io/). Extract and normalize keywords from text with automatic synonym resolution.

## Features

- 🚀 **Fast**: Runs on Cloudflare's global network at the edge
- 🔍 **Fuzzy Matching**: Intelligent synonym matching with configurable tolerance
- 📦 **Lightweight**: Minimal dependencies, optimized for edge runtime
- 🛡️ **Type Safe**: Full TypeScript support
- 🌐 **CORS Enabled**: Cross-origin ready by default
- ✅ **Tested**: Comprehensive test suite included

## API

### GET `/`

Get service information and available endpoints.

**Response:**
```json
{
  "service": "fuse-extractor",
  "version": "1.0.0",
  "endpoints": {
    "POST": "/normalize - Extract and normalize keywords from text",
    "GET": "/ - Service information"
  }
}
```

### POST `/normalize`

Extract and normalize keywords from text with synonym matching.

**Request:**
```json
{
  "text": "please signin to authenticate"
}
```

**Response:**
```json
{
  "input": "please signin to authenticate",
  "keywords": ["login", "auth"]
}
```

## Built-in Synonyms

The service includes domain-specific synonym mapping:

- `signin`, `signon`, `sign-in`, `sign-on` → `login`
- `authenticate`, `authentication` → `auth`
- `signup` → `register`

Extend by modifying the `synonymMap` in [src/index.ts](src/index.ts).

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Local Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build and deploy
npm run deploy
```

### Project Structure

```
fuse-extractor/
├── src/
│   └── index.ts          # Main worker implementation
├── test/
│   └── index.test.ts     # Test suite
├── package.json          # Dependencies and scripts
├── wrangler.toml         # Cloudflare Workers configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Deployment

### Option 1: Deploy Button
Click the deploy button at the top to automatically deploy to Cloudflare Workers via GitHub integration.

### Option 2: Manual Deployment

```bash
# Install Wrangler (if not already installed)
npm install -g @cloudflare/wrangler

# Authenticate with Cloudflare
wrangler login

# Deploy
npm run deploy
```

### Option 3: CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Configuration

Edit [wrangler.toml](wrangler.toml) to customize:

- **Service name**: Change `name = "fuse-extractor"`
- **Custom domain**: Update routes in `[env.production]`
- **Environment variables**: Add them to the `[[env]]` section

## Examples

### Using cURL

```bash
curl -X POST https://fuse-extractor.dev/normalize \
  -H "Content-Type: application/json" \
  -d '{"text": "sign in to authenticate"}'
```

### Using JavaScript

```javascript
const response = await fetch('https://fuse-extractor.dev/normalize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'please signin to authenticate' })
});

const data = await response.json();
console.log(data.keywords); // ['login', 'auth']
```

### Using Python

```python
import requests

response = requests.post(
    'https://fuse-extractor.dev/normalize',
    json={'text': 'sign up for registration'}
)

print(response.json())
# {'input': 'sign up for registration', 'keywords': ['register']}
```

## Monitoring

- **View logs**: `wrangler tail`
- **Real-time analytics**: Check the Cloudflare dashboard
- **Error tracking**: Log errors and debug information during development

## Performance

- **CPU**: Limited to 50ms per request
- **Response time**: <100ms typical latency from edge
- **Throughput**: Millions of requests per day with free tier

## Bugs Fixed

This version improves upon the original with:

1. ✅ **Better error handling**: Distinguishes between JSON parsing errors and other exceptions
2. ✅ **Type safety**: Added interfaces for request/response types
3. ✅ **Deduplication**: Keywords are now deduplicated
4. ✅ **Helper functions**: Cleaner response creation and CORS handling
5. ✅ **Health checks**: GET / endpoint for service monitoring
6. ✅ **Comprehensive tests**: Full test coverage included

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT - See [LICENSE](LICENSE) for details

## Support

For issues, questions, or suggestions:
- Open an [issue on GitHub](https://github.com/cliffzhu/fuse-extractor/issues)
- Check [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- Review [fuse.js documentation](https://fusejs.io/)

---

**Website**: https://github.com/cliffzhu/fuse-extractor
