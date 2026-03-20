// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';

export async function generateSitemap(routes, outputDir, baseUrl = '') {
  const urls = routes.map(route => {
    const loc = baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : route;
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const dest = path.join(outputDir, 'sitemap.xml');
  await fs.writeFile(dest, xml, 'utf8');
  return dest;
}

export async function routesFromSitemap(sitemapPath) {
  let content;

  if (sitemapPath.startsWith('http')) {
    content = await fetchUrl(sitemapPath);
  } else {
    content = await fs.readFile(path.resolve(process.cwd(), sitemapPath), 'utf8');
  }

  // Handle sitemap index — fetch all child sitemaps
  if (content.includes('<sitemapindex')) {
    const locs = [...content.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
    const allRoutes = [];
    for (const loc of locs) {
      const child = await fetchUrl(loc);
      allRoutes.push(...extractRoutes(child));
    }
    return [...new Set(allRoutes)];
  }

  return extractRoutes(content);
}

function extractRoutes(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(m => {
      try { return new URL(m[1].trim()).pathname; } catch { return m[1].trim(); }
    })
    .filter(r => r.startsWith('/'));
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}
