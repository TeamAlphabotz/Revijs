// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import fs from 'fs/promises';
import path from 'path';

export async function discoverRoutes(distDir) {
  const routes = new Set(['/']);

  try {
    const indexHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
    extractLinksFromHtml(indexHtml, routes);
  } catch {}

  // Walk dist/ for any pre-existing HTML files (already built static routes)
  await walkDir(distDir, distDir, routes);

  return [...routes].sort((a, b) => a === '/' ? -1 : a.localeCompare(b));
}

function extractLinksFromHtml(html, routes) {
  // href links
  const hrefs = [...html.matchAll(/href=["']([^"'#?]+)["']/g)];
  for (const [, href] of hrefs) {
    if (href.startsWith('/') && !href.match(/\.(js|css|png|jpg|svg|ico|woff|json|xml)$/i)) {
      routes.add(href.replace(/\/$/, '') || '/');
    }
  }

  // React Router style routes in JS chunks (basic heuristic)
  const jsRoutes = [...html.matchAll(/path:\s*["'](\\/[^"']+)["']/g)];
  for (const [, r] of jsRoutes) {
    if (!r.includes(':') && !r.includes('*')) routes.add(r);
  }
}

async function walkDir(base, dir, routes) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(base, full, routes);
      } else if (entry.name === 'index.html') {
        const rel = '/' + path.relative(base, path.dirname(full)).replace(/\\/g, '/');
        routes.add(rel === '/.' ? '/' : rel);
      }
    }
  } catch {}
}
