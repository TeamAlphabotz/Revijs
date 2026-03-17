# ⚡ ReviJs

[![npm version](https://badge.fury.io/js/revijs.svg)](https://badge.fury.io/js/revijs)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/workflow/status/TeamAlphabotz/Revijs/CI)](https://github.com/TeamAlphabotz/Revijs/actions)
[![Made with Love](https://img.shields.io/badge/made%20with-love-orange.svg)](https://github.com/TeamAlphabotz/Revijs)
![AlphaBotz](https://img.shields.io/badge/🚀-AlphaBotz-blueviolet)

> **Local-first SPA prerender CLI** — convert your React/Vite app into SEO-friendly static HTML, with zero cloud dependency.

---

## 🌟 Table of Contents

- [How it works](#how-it-works)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Implementation Details](#implementation-details)
- [Middleware Example](#middleware-example)
- [Programmatic API](#programmatic-api)
- [Credits & Community](#credits--community)
- [License](#license)

---

## 🚀 How it works

1. Build your React/Vite app: `npm run build`
2. Run ReviJs: `npx revijs`
3. ReviJs spins up a local server, launches a headless browser, and iterates over your routes.
4. For each route:
    - The app is loaded
    - Waits for all network/data (customizable with `waitFor`)
    - Full dynamic HTML is captured
5. Outputs are written to `dist-prerendered/`
6. **SEO boost:** Bots get static HTML; users get SPA.

### GIF Demo

![Demo GIF 1](https://github.com/TeamAlphabotz/Revijs/raw/main/assets/demo1.gif)  
*[Replace with your own GIF URL]*

---

## ⚡ Quick start

```bash
# 1. Install
npm install revijs

# 2. Create config
npx revijs init

# 3. Build your app
npm run build

# 4. Prerender your routes
npx revijs
```

---

## ⚙️ Configuration (`revi.config.js`)

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

- **routes**: All SPA routes you want to prerender
- **engine**: Rendering mode (`browser` for headless, `advanced`/`ssr` for future upgrades)
- **waitFor**: Milliseconds after network idle (tweak if your routes take longer)
- **outputDir**: Where static HTML goes
- **distDir**: Directory for built files (`dist` by default)

---

## 🛠️ Implementation Details

#### Prerender Process

ReviJs uses a headless Chromium browser to load your local build. For each route:

- Launches route via the local server
- Waits (`waitFor`) for all data requests to finish (network idle)
- Gets the rendered HTML
- Writes to `outputDir`
- Handles errors, logs progress, supports custom hooks

#### Example CLI Logic

```js
import { prerender } from 'revijs';

await prerender({
  routes: ['/', '/about'],
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  engine: 'browser',
  headless: true,
  waitFor: 1200,
});
```

#### Handling Bots vs. Users

- Bots detected via User-Agent
- Middleware serves prerendered HTML to bots, SPA to users

---

## 🧩 Middleware Example

Serve prerendered HTML to search engines:

```js
import express from 'express';
import { createMiddleware } from 'revijs';

const app = express();
app.use(createMiddleware({ prerenderedDir: 'dist-prerendered' }));

app.listen(4173, () => {
  console.log('Serving with ReviJs middleware!');
});
```

---

## 🤖 Programmatic API

Use in scripts:

```js
import { prerender } from 'revijs';

await prerender({
  routes: ['/','/about'],
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  headless: true,
  waitFor: 1500,
});
```

---

## 🏆 Credits & Community

Made with ❤️ by:

- [Utkarsh Dubey](https://github.com/utkarshdubey2008)
- [Adarsh](https://github.com/teamalphabotz)
- Telegram:
    - [@thealphabotz](https://t.me/thealphabotz) (channel)
    - [@alphabotzchat](https://t.me/alphabotzchat) (group)
    - [@alter69x](https://t.me/alter69x)
    - [@akanesakuramori](https://t.me/akanesakuramori)

*Made by Adarsh, Utkarsh — Telegram handles as above, managed respectively.*

Join our community for help, stickers, updates, and collab:

- ![Telegram Sticker](https://github.com/TeamAlphabotz/Revijs/raw/main/assets/sticker.png)  
*[Replace with your own sticker image]*

---

## 📄 License

[MIT License](LICENSE)

---

## 💬 Feedback

If you like this project, please star ⭐ the repo, contribute, or join us on [Telegram](https://t.me/thealphabotz).

---

## 🎬 More GIFs & UI

![Demo GIF 2](https://github.com/TeamAlphabotz/Revijs/raw/main/assets/demo2.gif)  
*[Replace with GIFs/screens]*

---

## 🌐 Related Projects

- [Alphabotz on GitHub](https://github.com/teamalphabotz)
- [Utkarsh Dubey on GitHub](https://github.com/utkarshdubey2008)

---
