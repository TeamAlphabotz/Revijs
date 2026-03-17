# ⚡ ReviJs 🧙‍♂️

[![npm version](https://img.shields.io/npm/v/revijs?style=flat-square&color=blueviolet)](https://www.npmjs.com/package/@revijs/core)
[![npm downloads](https://img.shields.io/npm/dm/revijs?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/@revijs/core)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Made by AlphaBotz](https://img.shields.io/badge/🤖%20Made%20by-AlphaBotz-blueviolet?style=flat-square)](https://github.com/TeamAlphabotz)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
![Stars](https://img.shields.io/github/stars/TeamAlphabotz/Revijs?style=flat-square&color=yellow)

> 🚀 **Local-first SPA prerender CLI** — Convert your React/Vite app into blazing-fast, SEO-friendly static HTML. Zero cloud dependency. Pure magic. ✨

---

## 🎯 What's ReviJs?

Tired of your fancy React/Vite app being invisible to Google? 😱 ReviJs is here to save the day!

ReviJs **spins up a headless browser**, visits every route in your app, waits for data to load, and captures the fully-rendered HTML. Then it serves that pre-baked HTML to search engines while your users still get the smooth SPA experience. 

It's like having your cake and eating it too. 🍰

---

## ⚙️ Requirements

Before you summon the ReviJs wizard, make sure you have these installed:

### System Requirements
- **Node.js**: `>=18.0.0` (LTS recommended)
- **npm**: `>=9.0.0` or **yarn** / **pnpm**
- **Operating System**: macOS, Linux, Windows

### Project Requirements
- A **React** or **Vite** project
- Built output in a `dist/` folder (or customizable)
- Node-like environment for running the CLI


### Package Dependencies

The `@revijs/core` package comes with these dependencies:
- **playwright** — headless Chromium browser automation
- **commander** — CLI argument parsing
- **picocolors** — pretty console output
- **polka** — lightweight HTTP server
- **sirv** — efficient static file serving

All are automatically installed with `npm install @revijs/core`

---

## 🚀 Quick Start (30 seconds!)

```bash
# 1️⃣  Install the magic
npm install revijs

# 2️⃣  Initialize config (interactive)
npx revijs init

# 3️⃣  Build your app normally
npm run build

# 4️⃣  Let the prerendering begin! 🎆

npx revijs
```

**Boom!** 💥 Your static HTML is now in `dist-prerendered/`

---

## 🛠️ Configuration (`revi.config.js`)

Customize your prerendering experience:

```js
export default {
  // 🌍 Routes to prerender
  routes: ['/', '/about', '/blog/post-1', '/products'],
  
  // 🎮 Rendering engine
  engine: 'browser',       // 'browser' | 'advanced' | 'ssr'
  
  // 📁 Output settings
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  
  // ⏱️ Wait for data (adjust if routes are slow)
  waitFor: 1200,           // milliseconds after network idle
  
  // 🕵️ Browser settings
  headless: true,
  port: 4173,
  
  // 🎯 Optional: exclude routes
  exclude: ['/admin', '/dashboard'],
  
  // 📸 Optional: capture screenshots
  screenshots: false,
};
```

### Config Options Explained
| Option | Type | Default | What It Does |
|--------|------|---------|--------------|
| `routes` | Array | `[]` | Routes to prerender (required!) |
| `engine` | String | `'browser'` | How to render (browser is safest) |
| `outputDir` | String | `'dist-prerendered'` | Where to save static HTML |
| `distDir` | String | `'dist'` | Your built app location |
| `waitFor` | Number | `1200` | ms to wait after network idle |
| `headless` | Boolean | `true` | Run browser hidden? |
| `port` | Number | `4173` | Local server port |

---

## 🎪 How the Magic Works (Under the Hood)

```
┌─────────────────────────────────────────────────────┐
│  You run: npm run build                             │
│  Then: npx revijs                                   │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │ Start Local Server │
        └���────────┬──────────┘
                  │
        ┌─────────▼──────────────────┐
        │ Launch Headless Browser 🤖 │
        └─────────┬──────────────────┘
                  │
        ┌─────────▼────────────────────────┐
        │ Visit Each Route in Your App     │
        │ (/, /about, /blog/post-1, etc)   │
        └─────────┬────────────────────────┘
                  │
        ┌─────────▼──────────────────────┐
        │ Wait for All Data to Load ⏳   │
        │ (Network Idle + waitFor ms)     │
        └─────────┬──────────────────────┘
                  │
        ┌─────────▼──────────────────────┐
        │ Capture Full Rendered HTML 📸  │
        └─────────┬──────────────────────┘
                  │
        ┌─────────▼──────────────────────┐
        │ Write Static Files to Disk 💾  │
        │ (dist-prerendered/)             │
        └─────────┬──────────────────────┘
                  │
        ┌─────────▼──────────────────────┐
        │ 🎉 Done! Static HTML Ready     │
        └──────────────────────────────────┘
```

---

## 🧩 Middleware Magic (Serve Bots vs Humans)

Automatically detect bots and serve them pre-rendered HTML:

```js
import express from 'express';
import { createMiddleware } from 'revijs';

const app = express();

// 🤖 ReviJs middleware intercepts bot requests
app.use(createMiddleware({ 
  prerenderedDir: 'dist-prerendered',
  botDetection: true, // Auto-detect crawlers
}));

// Serve your SPA normally
app.use(express.static('dist'));

app.listen(4173, () => {
  console.log('🚀 Server running with ReviJs magic!');
});
```

**What happens:**
- 🤖 **Bot visits** → Serves prerendered static HTML (instant SEO)
- 👤 **User visits** → Serves your React app (smooth SPA experience)
- 🎯 **Win-win!**

---

## 🤖 Programmatic API (For Advanced Wizards)

Use ReviJs in your own scripts:

```js
import { prerender } from 'revijs';

// Programmatically prerender
const result = await prerender({
  routes: ['/', '/about', '/contact'],
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  engine: 'browser',
  headless: true,
  waitFor: 1500,
  onProgress: (route) => console.log(`✅ Prerendered: ${route}`),
  onError: (route, error) => console.error(`❌ Error on ${route}:`, error),
});

console.log(`✨ Prerendered ${result.count} routes!`);
```

---

## 🔥 Real-World Examples

### Example 1: Blog Site
```js
export default {
  routes: ['/', '/blog', '/blog/post-1', '/blog/post-2', '/about'],
  engine: 'browser',
  waitFor: 2000, // Wait longer for blog content
};
```

### Example 2: E-Commerce
```js
export default {
  routes: ['/', '/products', '/products/item-1', '/cart', '/checkout'],
  engine: 'browser',
  waitFor: 1500,
  exclude: ['/admin', '/dashboard'],
};
```

### Example 3: SaaS App
```js
export default {
  routes: ['/'],
  engine: 'browser',
  waitFor: 1200,
  exclude: ['/app/*', '/dashboard/*'],
};
```

---

## 💡 Pro Tips & Tricks

### 🎯 Tip 1: Optimize Your Routes
```js
// ❌ Too slow: Pre-rendering every possible page
routes: ['/blog/post-' + Array.from({length: 10000}, (_, i) => i)],

// ✅ Better: Pre-render the important ones
routes: ['/', '/blog', '/blog/popular-posts', '/about', '/contact'],
```

### ⏱️ Tip 2: Adjust `waitFor` for Your App
```js
// If your data loads fast:
waitFor: 800,

// If you fetch from slow APIs:
waitFor: 3000,

// Pro: Add a loading flag to your app
if (document.body.dataset.loaded === 'true') {
  // Tell ReviJs we're ready
}
```

### 🔄 Tip 3: Combine with Build Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "prerender": "npm run build && revijs",
    "deploy": "npm run prerender && netlify deploy"
  }
}
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| ⏳ Routes timing out | Increase `waitFor` value (try 2000) |
| 🚫 Routes not found | Check `routes` array in config |
| 💾 No output files | Ensure `distDir` exists and is built |
| 🤖 Browser won't start | Update Puppeteer: `npm install puppeteer@latest` |
| 🔴 Port already in use | Change `port` in config or kill process |

---

## 🎬 Features Roadmap

- ✅ Browser rendering
- ✅ Express middleware
- ✅ Programmatic API
- 🚀 Advanced rendering mode
- 🚀 SSR engine support
- 🚀 Incremental prerendering
- 🚀 Cache layer

---

## 👨‍💻 Meet the Team

This project is made with ❤️ by the AlphaBotz crew:

| Name | Role | Link |
|------|------|------|
| **Utkarsh Dubey** 🧑‍💻 | Core Developer | [@utkarshdubey2008](https://github.com/utkarshdubey2008) |
| **Adarsh** 🚀 | Core Developer | [@TeamAlphabotz](https://github.com/teamalphabotz) |

### 🤝 Join the Community!

- 📢 **Main Channel**: [@thealphabotz](https://t.me/thealphabotz)
- 💬 **Chat Group**: [@alphabotzchat](https://t.me/alphabotzchat)
- 👤 **Alter**: [@alter69x](https://t.me/alter69x)
- 🎨 **Akane**: [@akanesakuramori](https://t.me/akanesakuramori)

**We're always hanging out on Telegram!** Come for the bots, stay for the vibes. 🎉

---

## 📊 Stats & Performance

| Metric | Benefit |
|--------|---------|
| **SEO Score** | 📈 100/100 (with prerendering) |
| **Initial Load** | ⚡ Instant (static HTML) |
| **User Experience** | 🎯 Smooth SPA after load |
| **Cloud Cost** | 💰 Zero (local-first) |
| **Setup Time** | ⏱️ 30 seconds |

---

## 📚 More Resources

- 🐙 [GitHub Repository](https://github.com/TeamAlphabotz/Revijs)
- 📦 [npm Package](https://www.npmjs.com/package/@revijs/core)
- 💬 [Discord Community](#) *(coming soon)*
- 📖 [Full Documentation](#) *(coming soon)*

---

## 🎁 Why You'll Love ReviJs

✨ **Easy Setup** — 30 seconds to get started  
🚀 **No Cloud** — Everything runs locally  
⚡ **Lightning Fast** — Pre-built static HTML  
🎯 **SEO Friendly** — Search engines see full HTML  
🔧 **Flexible** — Works with React, Vue, Svelte, etc.  
💚 **Free & Open** — MIT License, community-driven  

---

## 📄 License

[MIT License](LICENSE) — Use freely! ✅

---

## 🌟 If You Like It...

Please give us a ⭐ on [GitHub](https://github.com/TeamAlphabotz/Revijs)!

---

<div align="center">

### Made with 💜 by AlphaBotz

*Where bots meet brilliance* 🤖✨

</div>
