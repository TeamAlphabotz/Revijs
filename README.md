# ⚡ ReviJs

> Local-first SPA prerender CLI — convert your React/Vite app into SEO-friendly static HTML, with zero cloud dependency.

---

## How it works

1. You run `npm run build` as normal
2. You run `npx revijs`
3. ReviJs spins up a local server, opens each of your routes in a headless browser, waits for all data to load, and captures the full HTML
4. Static files are written to `dist-prerendered/`
5. A bot visits your site → your server returns the prerendered HTML → perfect SEO

---

## Quick start

```bash
# 1. Install
npm install revijs

# 2. Create config
npx revijs init

# 3. Build your app
npm run build

# 4. Prerender
npx revijs
```

---

## Config (`revi.config.js`)

```js
export default {
  routes: ['/', '/about', '/blog/post-1'],
  engine: 'browser',       // 'browser' | 'advanced' | 'ssr'
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  waitFor: 1200,           // ms after network idle
  headless: true,
  port: 4173,
};
```

---

## Middleware (optional)

Serve prerendered HTML to bots while normal users get the live SPA:

```js
import express from 'express';
import { createMiddleware } from 'revijs';

const app = express();
app.use(createMiddleware({ prerenderedDir: 'dist-prerendered' }));
```

---

## Programmatic API

```js
import { prerender } from 'revijs';

await prerender({
  routes: ['/', '/about'],
  outputDir: 'dist-prerendered',
});
```

---

## License

MIT
