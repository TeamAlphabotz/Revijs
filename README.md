# ReviJs

> The SPA prerender toolkit that actually works. Local-first, zero cloud, built for developers who are tired of their React app being invisible to Google.

[![npm](https://img.shields.io/npm/v/@revijs/core?style=flat-square)](https://www.npmjs.com/package/@revijs/core)
[![downloads](https://img.shields.io/npm/dm/@revijs/core?style=flat-square)](https://www.npmjs.com/package/@revijs/core)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![node](https://img.shields.io/badge/node-18+-brightgreen?style=flat-square)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/TeamAlphabotz/Revijs?style=flat-square)](https://github.com/TeamAlphabotz/Revijs)

---

## The problem

Your React app looks great in a browser. But when Googlebot, GPTBot, or any other crawler visits it — they see an empty `<div id="root"></div>`. No content. No metadata. Nothing to index.

That is why your SEO is suffering. ReviJs fixes this.

---

## How it works

ReviJs opens your app in a real headless Chromium browser, waits for all your data to load, captures the full rendered HTML, and either saves it as static files or serves it live to bots on demand — while your real users continue to get the normal React experience.

Two modes. You pick what fits your setup.

---

## Quick start

```bash
npm install @revijs/core
npx revijs init
npm run build
npx revijs
```

Your prerendered HTML files are now in `dist-prerendered/`. Deploy them alongside your app and bots will see full content on every page.

---

## Mode 1 — Static prerender (run once, deploy)

Best for static hosts like Netlify, Vercel, Cloudflare Pages.

```bash
npx revijs
```

ReviJs starts a local server, opens every route in a headless browser, waits for data to load, and writes the full HTML to disk.

```
dist-prerendered/
├── index.html
├── about/
│   └── index.html
└── blog/
    └── post-1/
        └── index.html
```

Deploy this folder. Done.

---

## Mode 2 — Live middleware (real-time, always fresh)

Best for VPS, DigitalOcean, any Node.js server.

Add two lines to your existing server:

```js
import express from 'express'
import { createLiveMiddleware } from '@revijs/core'

const app = express()

app.use(createLiveMiddleware({
  distDir: 'dist',
  ttl: 30,        // cache each page for 30 minutes
  debug: false,
}))

app.use(express.static('dist'))
app.listen(3000)
```

Now whenever a bot hits any route on your server — ReviJs renders that page in real time, serves the full HTML to the bot, caches it for 30 minutes, then renders fresh again next time. Your content is always up to date. No manual step. No cron job. Nothing to remember.

Real users hit the same server and get the normal React app — the middleware only intercepts bot requests.

---

## Configuration

Create `revi.config.js` in your project root, or run `npx revijs init` to generate one.

```js
export default {
  // Routes to prerender
  routes: ['/', '/about', '/blog/post-1'],

  // Or read routes from a sitemap (supports sitemap-index.xml)
  sitemapInput: null, // './sitemap.xml' or 'https://yoursite.com/sitemap-index.xml'

  // Or let ReviJs find routes automatically from your dist/ folder
  autoDiscover: false,

  // Or define routes dynamically from your own API
  // routes: async () => {
  //   const posts = await fetch('/api/posts').then(r => r.json())
  //   return posts.map(p => `/blog/${p.slug}`)
  // },

  engine: 'browser',        // 'browser' | 'advanced' | 'ssr'
  outputDir: 'dist-prerendered',
  distDir: 'dist',

  // Smart wait — pick one strategy
  waitFor: 1200,            // wait X ms after network idle (default)
  readyFlag: false,         // wait for window.__REVI_READY__ = true in your app
  waitForSelector: null,    // wait for a CSS selector, e.g. '#app[data-loaded]'

  // Output
  injectMeta: true,         // auto-inject missing og:title, og:description, og:image
  injectHead: null,         // inject custom HTML into <head> of every page
  sitemap: false,           // generate sitemap.xml after render. Set to your base URL for absolute URLs
  score: true,              // print SEO score for each page after rendering
  report: true,             // save revi-report.json after each run
  cache: false,             // skip unchanged routes on next run (uses content hash)
  retries: 2,               // retry failed routes N times before giving up
  parallel: 1,              // number of routes to render at the same time

  headless: true,
  port: 4173,
  debug: false,
};
```

### All options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `routes` | `string[] \| async fn` | `['/']` | Routes to prerender, or async function that returns routes |
| `sitemapInput` | `string` | `null` | Path or URL to sitemap.xml or sitemap-index.xml |
| `autoDiscover` | `boolean` | `false` | Scan dist/ and discover routes automatically |
| `engine` | `string` | `'browser'` | Rendering engine: browser, advanced, ssr |
| `outputDir` | `string` | `'dist-prerendered'` | Where to write HTML files |
| `distDir` | `string` | `'dist'` | Your built SPA directory |
| `waitFor` | `number` | `1200` | ms to wait after network idle |
| `readyFlag` | `boolean` | `false` | Wait for `window.__REVI_READY__ = true` |
| `waitForSelector` | `string` | `null` | Wait for a CSS selector to appear in DOM |
| `injectMeta` | `boolean` | `true` | Auto-inject missing og: and twitter: meta tags |
| `injectHead` | `string` | `null` | Custom HTML to inject into `<head>` on every page |
| `sitemap` | `boolean\|string` | `false` | Generate sitemap.xml. Set to base URL for absolute URLs |
| `score` | `boolean` | `true` | Print SEO score report in terminal |
| `report` | `boolean` | `true` | Save `revi-report.json` with full results |
| `cache` | `boolean` | `false` | Skip routes whose content hasn't changed since last run |
| `retries` | `number` | `2` | Retry failed routes before marking them as failed |
| `parallel` | `number` | `1` | Render multiple routes simultaneously |
| `headless` | `boolean` | `true` | Run browser in background |
| `port` | `number` | `4173` | Local server port |
| `debug` | `boolean` | `false` | Verbose logging |

---

## CLI commands

```bash
# Prerender all routes
npx revijs

# Generate a starter config file
npx revijs init

# Watch dist/ for changes and re-render automatically
npx revijs watch

# Open the dashboard in your browser
npx revijs ui

# Print the last prerender report
npx revijs report

# Deploy your output to a hosting provider
npx revijs deploy --target=netlify
npx revijs deploy --target=vercel
npx revijs deploy --target=cloudflare

# Force re-render everything, ignore cache
npx revijs --no-cache
```

---

## Smart wait strategy

The default `waitFor: 1200` is just a timer — it waits 1.2 seconds and hopes your data has loaded. For production use, tell ReviJs exactly when your app is ready.

**Option 1 — Ready flag (recommended)**

In your React app, set a flag when everything is loaded:

```js
useEffect(() => {
  Promise.all([fetchPosts(), fetchUser()]).then(() => {
    window.__REVI_READY__ = true
  })
}, [])
```

In your config:

```js
readyFlag: true,
waitFor: 0,
```

ReviJs will wait for that flag instead of guessing.

**Option 2 — Wait for a DOM element**

```js
waitForSelector: '#app[data-loaded="true"]',
```

ReviJs waits for that element to appear before capturing HTML.

---

## Cache layer

On large sites with many routes, re-rendering everything on every run is slow. Enable caching:

```js
cache: true,
```

ReviJs hashes the rendered HTML for each route. On the next run, if the hash matches — it skips that route entirely. Only changed pages get re-rendered. A site with 500 routes where 10 changed will only render those 10.

The cache is stored in `dist-prerendered/.revi-cache.json`.

---

## SEO scoring

After each render, ReviJs scores every page and prints a report:

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

Checks performed on each page: title tag, meta description, og:title, og:description, og:image, h1 tag, image alt attributes, canonical link, lang attribute.

---

## Prerender report

After each run, a `revi-report.json` file is saved to your output directory:

```json
{
  "generatedAt": "2026-03-20T11:00:00.000Z",
  "summary": {
    "total": 5,
    "ok": 5,
    "failed": 0,
    "avgScore": 84
  },
  "routes": [
    {
      "route": "/",
      "ms": 1823,
      "score": 100,
      "passed": ["Has <title>", "Has og:title", "Has h1"],
      "failed": []
    }
  ],
  "errors": []
}
```

View the last report anytime:

```bash
npx revijs report
```

---

## Meta tag injection

ReviJs automatically adds missing meta tags to each rendered page based on the page content. If your page has a `<title>` and an `<h1>` but no og: tags, ReviJs will inject them:

```html
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="First heading content" />
<meta property="og:image" content="/first-image-found.png" />
<meta name="twitter:card" content="summary_large_image" />
```

You can also inject custom HTML into every page's `<head>`:

```js
injectHead: '<link rel="preconnect" href="https://fonts.googleapis.com" />',
```

---

## Sitemap support

**Generate a sitemap after prerendering:**

```js
sitemap: 'https://yoursite.com',
```

Creates `dist-prerendered/sitemap.xml` with all rendered routes.

**Read routes from an existing sitemap:**

```js
sitemapInput: 'https://yoursite.com/sitemap-index.xml',
```

Supports both regular `sitemap.xml` and `sitemap-index.xml`. ReviJs fetches all child sitemaps from the index and extracts every route automatically.

---

## Vite plugin

Auto-prerender after every `npm run build`:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reviPlugin } from '@revijs/core'

export default defineConfig({
  plugins: [
    react(),
    reviPlugin(),
  ],
})
```

After this, running `npm run build` will automatically prerender your app. No separate command needed.

---

## Dashboard

```bash
npx revijs ui
```

Opens a local web dashboard showing render status, time per route, SEO scores per page, and any errors. You can trigger a new prerender run directly from the dashboard.

---

## Static middleware

If you are running a Node.js server and want to serve prerendered files to bots from disk:

```js
import express from 'express'
import { createMiddleware } from '@revijs/core'

const app = express()
app.use(createMiddleware({ prerenderedDir: 'dist-prerendered' }))
app.use(express.static('dist'))
app.listen(3000)
```

---

## Live middleware

If you want real-time on-demand rendering with no pre-build step:

```js
import express from 'express'
import { createLiveMiddleware } from '@revijs/core'

const app = express()
app.use(createLiveMiddleware({
  distDir: 'dist',
  ttl: 30,           // cache rendered HTML for 30 minutes
  maxPages: 200,     // max number of pages to keep in cache
  waitFor: 1200,
  injectMeta: true,
  debug: false,
}))
app.use(express.static('dist'))
app.listen(3000)
```

| Option | Default | Description |
|--------|---------|-------------|
| `distDir` | `'dist'` | Your built SPA directory |
| `ttl` | `30` | Minutes to cache each rendered page |
| `maxPages` | `200` | Max pages in memory cache |
| `waitFor` | `1200` | ms to wait after network idle |
| `readyFlag` | `false` | Wait for `window.__REVI_READY__` |
| `waitForSelector` | `null` | Wait for CSS selector |
| `injectMeta` | `true` | Inject missing og: tags |
| `debug` | `false` | Log every bot request and cache hit |

---

## Programmatic API

```js
import { prerender } from '@revijs/core'

await prerender({
  routes: ['/', '/about', '/contact'],
  outputDir: 'dist-prerendered',
  injectMeta: true,
  score: true,
  cache: true,
  retries: 2,
})
```

Full API:

```js
import {
  prerender,
  loadConfig,
  renderAllPages,
  renderPage,
  saveHTML,
  createMiddleware,
  createLiveMiddleware,
  isBot,
  detectBot,
  generateSitemap,
  routesFromSitemap,
  discoverRoutes,
  injectMeta,
  scoreHTML,
  deploy,
  reviPlugin,
  watchMode,
} from '@revijs/core'
```

---

## Supported bots

ReviJs detects 30+ crawlers out of the box.

### Most common
| Bot | Company | Type |
|-----|---------|------|
| `googlebot` | Google | Search engine |
| `bingbot` | Microsoft | Search engine |
| `gptbot` | OpenAI | AI crawler |
| `claudebot` | Anthropic | AI crawler |
| `perplexitybot` | Perplexity AI | AI crawler |
| `facebookexternalhit` | Meta | Social preview |
| `twitterbot` | X | Social preview |
| `linkedinbot` | LinkedIn | Social preview |
| `yandexbot` | Yandex | Search engine |
| `baiduspider` | Baidu | Search engine |

<details>
<summary>View all supported bots</summary>

**Search engines**
`googlebot` `google-inspectiontool` `bingbot` `yandexbot` `baiduspider` `duckduckbot` `slurp` `sogou` `exabot` `rogerbot` `mj12bot` `dotbot` `ia_archiver`

**AI crawlers**
`gptbot` `chatgpt-user` `claudebot` `claude-web` `anthropic-ai` `perplexitybot` `cohere-ai` `amazonbot` `applebot`

**SEO tools**
`ahrefsbot` `semrushbot`

**Social and preview**
`facebookexternalhit` `twitterbot` `linkedinbot` `slackbot` `discordbot` `telegrambot` `whatsapp` `vkshare` `pinterest` `tumblr` `flipboard`

</details>

---

## Supported bot list in code

```js
const BOT_PATTERNS = [
  // Search engines
  'googlebot', 'google-inspectiontool', 'bingbot', 'slurp', 'duckduckbot',
  'baiduspider', 'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
  'mj12bot', 'dotbot', 'ahrefsbot', 'semrushbot', 'rogerbot',

  // AI / LLM crawlers
  'gptbot', 'chatgpt-user', 'claudebot', 'claude-web', 'perplexitybot',
  'cohere-ai', 'amazonbot', 'applebot', 'anthropic-ai',

  // Social / preview
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'slackbot', 'discordbot',
  'telegrambot', 'whatsapp', 'vkshare', 'pinterest', 'tumblr', 'flipboard',

  // Generic
  'spider', 'crawler', 'scraper', 'bot/', '+http',
]
```

---

## Hosting compatibility

| Platform | Static mode | Live middleware |
|----------|-------------|-----------------|
| VPS / DigitalOcean | Yes | Yes |
| Netlify | Yes | No |
| Vercel | Yes | No |
| Cloudflare Pages | Yes | No |
| AWS EC2 | Yes | Yes |
| Shared hosting (cPanel) | No | No |
| AWS Lambda / serverless | No | No |

Live middleware requires a persistent Node.js process. Static mode works everywhere you can upload files.

---

## Rendering engines

**browser** — Standard headless Chromium. Works for almost every React and Vite app. This is what you should use unless you have a specific reason not to.

**advanced** — Same as browser but also simulates page scroll to trigger lazy-loaded components. Injects a `<meta name="x-prerendered-by" content="revijs">` tag into the output.

**ssr** — Minimal-wait mode for apps that already have server-side rendering. Skips the waitFor delay.

---

## FAQ

**Does it work with Vue, Svelte, or other frameworks?**
Yes. ReviJs renders whatever the browser renders. It does not care about your framework.

**Does my app need any changes?**
No. ReviJs works with your existing built output. Optionally you can add `window.__REVI_READY__ = true` for smarter wait detection, but it is not required.

**Will it slow down my users?**
No. The live middleware only intercepts requests from known bots. Real users are never affected.

**Is the browser engine exposed to users?**
No. Playwright Chromium is an internal implementation detail. It installs automatically and is never exposed in the API.

**Why is my SEO score not 100?**
The score checks for meta description, canonical link, image alt attributes and other tags that your app may not have. These are real SEO issues worth fixing in your app, not ReviJs bugs.

---

## Team

| Name | Role |
|------|------|
| [Utkarsh Dubey](https://github.com/utkarshdubey2008) | Core Developer |
| [Adarsh](https://github.com/teamalphabotz) | Core Developer |

Telegram: [@thealphabotz](https://t.me/thealphabotz) · [@alphabotzchat](https://t.me/alphabotzchat)

---

MIT License — free to use, modify, and distribute.
