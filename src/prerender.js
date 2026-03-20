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
import { loadCache, saveCache, isCached, updateCache, readCachedHTML } from './utils/cache.js';
import { saveReport } from './utils/report.js';

export async function renderAllPages(config) {
  const {
    routes, outputDir, distDir, port, debug,
    injectMeta: doMeta, injectHead,
    score: doScore, sitemap,
    parallel = 1, cache: useCache,
    retries = 2, report: doReport,
  } = config;

  const expandedRoutes = await expandRoutes(routes);
  const { url, close } = await startServer(distDir, port);
  const engine = await getEngine(config);
  await fs.mkdir(outputDir, { recursive: true });

  const cacheStore = useCache ? await loadCache(outputDir) : {};
  const results = { ok: 0, failed: 0, skipped: 0, scores: [], renderTimes: [], errors: [] };

  try {
    const batches = chunkArray(expandedRoutes, Math.max(1, parallel));

    for (const batch of batches) {
      await Promise.all(batch.map(async (route) => {
        const pageUrl = `${url}${route === '/' ? '' : route}`;
        const start = Date.now();
        process.stdout.write(pc.dim(`  ${route} ... `));

        let html = null;
        let attempt = 0;
        let lastErr = null;

        // Retry loop
        while (attempt <= retries) {
          try {
            html = await renderPage(pageUrl, engine, config);
            break;
          } catch (err) {
            lastErr = err;
            attempt++;
            if (attempt <= retries) {
              await new Promise(r => setTimeout(r, 500 * attempt));
            }
          }
        }

        if (!html) {
          console.log(pc.red(`✖ (${retries} retries)`));
          console.error(pc.red(`    ${lastErr.message}`));
          results.failed++;
          results.errors.push({ route, error: lastErr.message });
          return;
        }

        // Check cache — skip if unchanged
        if (useCache) {
          const cached = await readCachedHTML(route, outputDir);
          if (cached && await isCached(route, html, cacheStore)) {
            console.log(pc.dim('↩ cached'));
            results.skipped++;
            if (doScore) results.scores.push(scoreHTML(cached, route));
            results.renderTimes.push({ route, ms: Date.now() - start });
            return;
          }
        }

        // Inject meta tags
        if (doMeta) html = injectMeta(html, route);

        // Inject custom head HTML
        if (injectHead) {
          html = html.replace('</head>', `  ${injectHead}\n</head>`);
        }

        await saveHTML(route, html, outputDir);

        if (useCache) updateCache(route, html, cacheStore);

        const ms = Date.now() - start;
        results.renderTimes.push({ route, ms });
        console.log(pc.green('✔') + pc.dim(` ${ms}ms`));

        if (doScore) results.scores.push(scoreHTML(html, route));
        results.ok++;
      }));
    }
  } finally {
    await engine.close();
    await close();
    if (useCache) await saveCache(outputDir, cacheStore);
  }

  // Sitemap
  if (sitemap) {
    const baseUrl = typeof sitemap === 'string' ? sitemap : '';
    const dest = await generateSitemap(expandedRoutes, outputDir, baseUrl);
    console.log(pc.dim(`  Sitemap: ${dest}`));
  }

  // Score report
  if (doScore && results.scores.length > 0) printScores(results.scores);

  // JSON report
  if (doReport) {
    const dest = await saveReport(results, outputDir);
    console.log(pc.dim(`  Report: ${dest}`));
  }

  const skippedStr = results.skipped > 0 ? pc.dim(`, ${results.skipped} cached`) : '';
  console.log(
    `\n  ${pc.green(`${results.ok} rendered`)}` +
    (results.failed > 0 ? pc.red(`, ${results.failed} failed`) : '') +
    skippedStr +
    `  →  ${pc.cyan(outputDir)}\n`
  );

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
