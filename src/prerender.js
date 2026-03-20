// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import path from 'path';
import fs from 'fs/promises';
import pc from 'picocolors';
import { startServer } from './utils/server.js';
import { getEngine } from './engines/index.js';
import { expandRoutes } from './utils/route-expander.js';
import { injectMeta } from './utils/meta-injector.js';
import { scoreHTML } from './utils/score.js';
import { generateSitemap } from './utils/sitemap.js';

export async function renderAllPages(config) {
  const { routes, outputDir, distDir, port, debug, injectMeta: doMeta, score: doScore, sitemap, parallel = 1 } = config;

  const expandedRoutes = await expandRoutes(routes);
  const { url, close } = await startServer(distDir, port);
  if (debug) console.log(pc.dim(`  Server: ${url}`));

  const engine = await getEngine(config);
  await fs.mkdir(outputDir, { recursive: true });

  const results = { ok: 0, failed: 0, scores: [], renderTimes: [] };

  try {
    // Render in batches based on parallel setting
    const batches = chunkArray(expandedRoutes, Math.max(1, parallel));

    for (const batch of batches) {
      await Promise.all(batch.map(async (route) => {
        const pageUrl = `${url}${route === '/' ? '' : route}`;
        const start = Date.now();
        process.stdout.write(pc.dim(`  ${route} ... `));

        try {
          let html = await renderPage(pageUrl, engine, config);

          if (doMeta) html = injectMeta(html, route);

          await saveHTML(route, html, outputDir);

          const ms = Date.now() - start;
          results.renderTimes.push({ route, ms });
          console.log(pc.green('✔') + pc.dim(` ${ms}ms`));

          if (doScore) {
            results.scores.push(scoreHTML(html, route));
          }

          results.ok++;
        } catch (err) {
          console.log(pc.red('✖'));
          console.error(pc.red(`    ${err.message}`));
          if (debug) console.error(err.stack);
          results.failed++;
        }
      }));
    }
  } finally {
    await engine.close();
    await close();
  }

  // Sitemap generation
  if (sitemap) {
    const baseUrl = typeof sitemap === 'string' ? sitemap : '';
    const sitemapPath = await generateSitemap(expandedRoutes, outputDir, baseUrl);
    console.log(pc.dim(`  Sitemap: ${sitemapPath}`));
  }

  // Score report
  if (doScore && results.scores.length > 0) {
    printScores(results.scores);
  }

  const summary = `\n  ${pc.green(`${results.ok} rendered`)}` +
    (results.failed > 0 ? pc.red(`, ${results.failed} failed`) : '') +
    `  →  ${pc.cyan(outputDir)}`;
  console.log(summary);

  if (results.failed > 0) throw new Error(`${results.failed} route(s) failed.`);

  return results;
}

export async function renderPage(url, engine, config) {
  return engine.render(url, {
    waitFor: config.waitFor,
    readyFlag: config.readyFlag,
    waitForSelector: config.waitForSelector,
    debug: config.debug,
  });
}

export async function saveHTML(route, html, outputDir) {
  const filePath = route === '/'
    ? path.join(outputDir, 'index.html')
    : path.join(outputDir, route.replace(/^\//, ''), 'index.html');

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

function printScores(scores) {
  console.log('\n  SEO Scores');
  console.log(pc.dim('  ' + '─'.repeat(44)));
  for (const s of scores) {
    const color = s.score >= 80 ? pc.green : s.score >= 50 ? pc.yellow : pc.red;
    console.log(`  ${color(`${s.score}%`.padEnd(5))}  ${s.route}`);
    if (s.failed.length > 0) {
      console.log(pc.dim(`           missing: ${s.failed.join(', ')}`));
    }
  }
  const avg = Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length);
  console.log(pc.dim('  ' + '─'.repeat(44)));
  console.log(`  avg ${avg}%`);
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
