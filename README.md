# ⚡ ReviJs 🧙‍♂️

[![npm version](https://img.shields.io/npm/v/@revijs/core?style=flat-square&color=blueviolet)](https://www.npmjs.com/package/@revijs/core)
[![npm downloads](https://img.shields.io/npm/dm/@revijs/core?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/@revijs/core)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Made by AlphaBotz](https://img.shields.io/badge/🤖%20Made%20by-AlphaBotz-blueviolet?style=flat-square)](https://github.com/TeamAlphabotz)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
![Stars](https://img.shields.io/github/stars/TeamAlphabotz/Revijs?style=flat-square&color=yellow)

> 🚀 **Local-first SPA prerender CLI** — Convert your React/Vite app into blazing-fast, SEO-friendly static HTML. Zero cloud dependency. Pure magic. ✨

---

## 🔗 Quick Links

- 📖 [Full Documentation](https://teamalphabotz.github.io/Revijs/)
- 🚀 [Getting Started](https://teamalphabotz.github.io/Revijs/#start)
- ⚙️ [Configuration](https://teamalphabotz.github.io/Revijs/#config)
- 🔌 [API Reference](https://teamalphabotz.github.io/Revijs/#api)
- 🧩 [Middleware](https://teamalphabotz.github.io/Revijs/#middleware)
- 💡 [Examples](https://teamalphabotz.github.io/Revijs/#examples)
- 🐙 [GitHub Repository](https://github.com/TeamAlphabotz/Revijs)
- 📦 [npm Package](https://www.npmjs.com/package/@revijs/core)

---

## 🎯 What's ReviJs?

Tired of your fancy React/Vite app being invisible to Google? 😱 ReviJs is here to save the day!

ReviJs **spins up a headless browser**, visits every route in your app, waits for data to load, and captures the fully-rendered HTML. Then it serves that pre-baked HTML to search engines while your users still get the smooth SPA experience.

It's like having your cake and eating it too. 🍰

---

## ⚙️ Requirements

- **Node.js**: `>=18.0.0`
- **npm**: `>=9.0.0` or yarn / pnpm
- **OS**: macOS, Linux, Windows
- A built React / Vite / Vue / Svelte app

---

## 🚀 Quick Start (30 seconds!)

```bash
# 1️⃣  Install
npm install @revijs/core

# 2️⃣  Initialize config
npx revijs init

# 3️⃣  Build your app
npm run build

# 4️⃣  Prerender!
npx revijs
```

**Boom!** 💥 Your static HTML is now in `dist-prerendered/`

---

## 🛠️ Configuration (`revi.config.js`)

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

## 🤖 Supported Bots

ReviJs automatically detects and serves prerendered HTML to all major crawlers.

### Most Common
| Bot | Company | Type |
|-----|---------|------|
| `googlebot` | Google | Search engine |
| `bingbot` | Microsoft | Search engine |
| `gptbot` | OpenAI | AI crawler |
| `claudebot` | Anthropic | AI crawler |
| `perplexitybot` | Perplexity AI | AI crawler |
| `facebookexternalhit` | Meta | Social preview |
| `twitterbot` | X (Twitter) | Social preview |
| `linkedinbot` | LinkedIn | Social preview |
| `yandexbot` | Yandex | Search engine |
| `baiduspider` | Baidu | Search engine |

<details>
<summary>View all supported bots</summary>

### Search Engines
`googlebot` `google-inspectiontool` `bingbot` `yandexbot` `baiduspider` `duckduckbot` `slurp` `sogou` `exabot` `rogerbot` `mj12bot` `dotbot` `ia_archiver`

### AI / LLM Crawlers
`gptbot` `chatgpt-user` `claudebot` `claude-web` `anthropic-ai` `perplexitybot` `cohere-ai` `amazonbot` `applebot`

### SEO Tools
`ahrefsbot` `semrushbot` `facebot`

### Social & Preview
`facebookexternalhit` `twitterbot` `linkedinbot` `slackbot` `discordbot` `telegrambot` `whatsapp` `vkshare` `pinterest` `tumblr` `flipboard`

### Generic Signals
`spider` `crawler` `scraper`

</details>

> Want to add a custom bot? Use the programmatic API — `isBot()` and `detectBot()` are fully exported.

## 🧩 Middleware

```js
import express from 'express';
import { createMiddleware } from '@revijs/core';

const app = express();
app.use(createMiddleware({ prerenderedDir: 'dist-prerendered' }));
app.use(express.static('dist'));
app.listen(3000);
```

---

## 🤖 Programmatic API

```js
import { prerender } from '@revijs/core';

await prerender({
  routes: ['/', '/about'],
  outputDir: 'dist-prerendered',
});
```

---

## 👨‍💻 Team

| Name | Role | Link |
|------|------|------|
| **Utkarsh Dubey** 🧑‍💻 | Core Developer | [@utkarshdubey2008](https://github.com/utkarshdubey2008) |
| **Adarsh** 🚀 | Core Developer | [@TeamAlphabotz](https://github.com/teamalphabotz) |

💬 **Telegram**: [@thealphabotz](https://t.me/thealphabotz) · [@alphabotzchat](https://t.me/alphabotzchat)

---

## 📄 License

[MIT License](LICENSE) — Use freely! ✅

---

<div align="center">

### Made with 💜 by AlphaBotz

*Where bots meet brilliance* 🤖✨

</div>
