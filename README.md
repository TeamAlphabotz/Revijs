## ReviJs

Local-first SPA prerender CLI. Converts React/Vite apps into SEO-friendly static HTML using a headless browser. Zero cloud dependency.

[![npm](https://img.shields.io/npm/v/@revijs/core?style=flat-square)](https://www.npmjs.com/package/@revijs/core)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![node](https://img.shields.io/badge/node-18+-brightgreen?style=flat-square)](https://nodejs.org/)

**Links:** [Documentation](https://teamalphabotz.github.io/Revijs/) · [npm](https://www.npmjs.com/package/@revijs/core) · [GitHub](https://github.com/TeamAlphabotz/Revijs)

---

## How it works

1. Run `npm run build` as normal
2. Run `npx revijs`
3. ReviJs starts a local server, opens each route in a headless browser, waits for data to load, captures the full HTML
4. Static files are written to `dist-prerendered/`
5. Bots get the static HTML — users get the live SPA

---

## Quick start

```bash
npm install @revijs/core
npx revijs init
npm run build
npx revijs
```

---

## Configuration

```js
// revi.config.js
export default {
  routes: ['/', '/about', '/blog/post-1'],
  engine: 'browser',        // 'browser' | 'advanced' | 'ssr'
  outputDir: 'dist-prerendered',
  distDir: 'dist',

  // Smart wait — choose one:
  waitFor: 1200,            // fixed delay after network idle
  readyFlag: false,         // wait for window.__REVI_READY__ = true
  waitForSelector: null,    // wait for a DOM element, e.g. '#app[data-loaded]'

  // Route sources — choose one:
  sitemapInput: null,       // read routes from sitemap or sitemap-index.xml
  autoDiscover: false,      // scan dist/ and find routes automatically

  // Output
  injectMeta: true,         // auto-inject missing og: meta tags
  sitemap: false,           // generate sitemap.xml (or set to your base URL)
  score: true,              // print SEO score for each page after rendering
  parallel: 1,              // number of routes to render in parallel

  headless: true,
  port: 4173,
  debug: false,
};
```

### All options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `routes` | `string[]` | `['/']` | Routes to prerender |
| `engine` | `string` | `'browser'` | Rendering engine |
| `outputDir` | `string` | `'dist-prerendered'` | Where to write HTML files |
| `distDir` | `string` | `'dist'` | Your built SPA directory |
| `waitFor` | `number` | `1200` | ms to wait after network idle |
| `readyFlag` | `boolean` | `false` | Wait for `window.__REVI_READY__ = true` |
| `waitForSelector` | `string` | `null` | Wait for a CSS selector to appear |
| `sitemapInput` | `string` | `null` | Path or URL to sitemap or sitemap-index.xml |
| `autoDiscover` | `boolean` | `false` | Auto-discover routes from dist/ |
| `injectMeta` | `boolean` | `true` | Inject missing og: meta tags |
| `sitemap` | `boolean\|string` | `false` | Generate sitemap.xml. Set to base URL for absolute URLs |
| `score` | `boolean` | `true` | Print SEO score report after rendering |
| `parallel` | `number` | `1` | Routes rendered in parallel |
| `headless` | `boolean` | `true` | Run browser in background |
| `port` | `number` | `4173` | Local server port |
| `debug` | `boolean` | `false` | Verbose logging |

---

## CLI commands

```bash
# Prerender all routes
npx revijs

# Generate starter config
npx revijs init

# Open dashboard UI in browser
npx revijs ui

# Deploy output to a hosting provider
npx revijs deploy --target=netlify
npx revijs deploy --target=vercel
npx revijs deploy --target=cloudflare
```

---

## Smart wait strategy

Instead of guessing with a fixed timer, you can tell ReviJs exactly when your app is ready.

**Option 1 — ready flag (recommended)**

In your app, set a flag when data is fully loaded:

```js
useEffect(() => {
  fetchData().then(() => {
    window.__REVI_READY__ = true;
  });
}, []);
```

In config:
```js
readyFlag: true,
waitFor: 0,
```

**Option 2 — wait for selector**

```js
waitForSelector: '#app[data-loaded="true"]',
```

---

## Auto route discovery

Let ReviJs find your routes automatically instead of listing them manually:

```js
autoDiscover: true,
```

It scans `dist/` for existing HTML files and extracts links from your built app.

---

## Sitemap support

Read routes from an existing sitemap (supports `sitemap-index.xml`):

```js
sitemapInput: 'https://yoursite.com/sitemap-index.xml',
```

Generate a `sitemap.xml` after prerendering:

```js
sitemap: 'https://yoursite.com',
```

---

## SEO scoring

After each render, ReviJs scores the HTML and prints a report:

```
  SEO Scores
  ────────────────────────────────────────────
  100%   /
   80%   /about
   60%   /blog/post-1
           missing: og:image, meta description
  ────────────────────────────────────────────
  avg 80%
```

Checks: title, meta description, og:title, og:description, og:image, h1 presence, image alt attributes, canonical link, lang attribute.

---

## Deploy

Deploy your prerendered output directly from the CLI:

```bash
npx revijs deploy --target=netlify
npx revijs deploy --target=vercel
npx revijs deploy --target=cloudflare
```

Requires the respective CLI to be installed (`netlify-cli`, `vercel`, `wrangler`).

---

## Dashboard

```bash
npx revijs ui
```

Opens a local web dashboard at `http://localhost:4200` showing render status, time per route, SEO scores, and errors.

---

## Middleware

Serve prerendered HTML to bots while real users get the live SPA:

```js
import express from 'express';
import { createMiddleware } from '@revijs/core';

const app = express();
app.use(createMiddleware({ prerenderedDir: 'dist-prerendered' }));
app.use(express.static('dist'));
app.listen(3000);
```

---

## Programmatic API

```js
import { prerender } from '@revijs/core';

await prerender({
  routes: ['/', '/about'],
  outputDir: 'dist-prerendered',
  score: true,
  injectMeta: true,
});
```

---

## Supported bots

### Most common
| Bot | Company | Type |
|-----|---------|------|
| `googlebot` | Google | Search |
| `bingbot` | Microsoft | Search |
| `gptbot` | OpenAI | AI |
| `claudebot` | Anthropic | AI |
| `perplexitybot` | Perplexity | AI |
| `facebookexternalhit` | Meta | Social |
| `twitterbot` | X | Social |
| `linkedinbot` | LinkedIn | Social |

<details>
<summary>View all supported bots</summary>

**Search engines**
`googlebot` `google-inspectiontool` `bingbot` `yandexbot` `baiduspider` `duckduckbot` `slurp` `sogou` `exabot` `rogerbot` `mj12bot` `dotbot` `ia_archiver`

**AI crawlers**
`gptbot` `chatgpt-user` `claudebot` `claude-web` `anthropic-ai` `perplexitybot` `cohere-ai` `amazonbot` `applebot`

**SEO tools**
`ahrefsbot` `semrushbot`

**Social / preview**
`facebookexternalhit` `twitterbot` `linkedinbot` `slackbot` `discordbot` `telegrambot` `whatsapp` `vkshare` `pinterest` `tumblr` `flipboard`

</details>

---

## More resources

- [Documentation](https://teamalphabotz.github.io/Revijs/)
- [Getting started](https://teamalphabotz.github.io/Revijs/#start)
- [Configuration](https://teamalphabotz.github.io/Revijs/#config)
- [API reference](https://teamalphabotz.github.io/Revijs/#api)
- [Middleware](https://teamalphabotz.github.io/Revijs/#middleware)
- [Examples](https://teamalphabotz.github.io/Revijs/#examples)
- [npm package](https://www.npmjs.com/package/@revijs/core)

---

## Team

| Name | Role |
|------|------|
| [Utkarsh Dubey](https://github.com/utkarshdubey2008) | Core Developer |
| [Adarsh](https://github.com/teamalphabotz) | Core Developer |

Telegram: [@thealphabotz](https://t.me/thealphabotz) · [@alphabotzchat](https://t.me/alphabotzchat)

---

MIT License
