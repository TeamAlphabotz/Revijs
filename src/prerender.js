import path from 'path';
import fs from 'fs/promises';
import pc from 'picocolors';
import { startServer } from './utils/server.js';
import { getEngine } from './engines/index.js';
import { expandRoutes } from './utils/route-expander.js';

/**
 * Render every route in config.routes and write static HTML to outputDir.
 *
 * @param {import('./config.js').ReviConfig} config
 */
export async function renderAllPages(config) {
  const { routes, outputDir, distDir, port, debug } = config;

  // 1. Expand any wildcard/dynamic route patterns
  const expandedRoutes = await expandRoutes(routes);

  // 2. Start temporary static server from dist/
  const { url, close } = await startServer(distDir, port);
  if (debug) console.log(pc.dim(`  Dev server: ${url}`));

  // 3. Boot the rendering engine
  const engine = await getEngine(config);

  // 4. Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const results = { ok: 0, failed: 0 };

  try {
    for (const route of expandedRoutes) {
      const pageUrl = `${url}${route === '/' ? '' : route}`;
      process.stdout.write(pc.dim(`  Rendering ${route} ... `));

      try {
        const html = await renderPage(pageUrl, engine, config);
        await saveHTML(route, html, outputDir);
        console.log(pc.green('✔'));
        results.ok++;
      } catch (err) {
        console.log(pc.red('✖'));
        console.error(pc.red(`    └─ ${err.message}`));
        if (debug) console.error(err.stack);
        results.failed++;
      }
    }
  } finally {
    await engine.close();
    await close();
  }

  // Summary
  console.log(
    `\n  ${pc.green(`${results.ok} rendered`)}` +
      (results.failed > 0 ? pc.red(`, ${results.failed} failed`) : '') +
      `  →  ${pc.cyan(outputDir)}`
  );

  if (results.failed > 0) {
    throw new Error(`${results.failed} route(s) failed to render.`);
  }
}

/**
 * Render a single page URL and return its full HTML string.
 *
 * @param {string} url
 * @param {object} engine
 * @param {import('./config.js').ReviConfig} config
 * @returns {Promise<string>}
 */
export async function renderPage(url, engine, config) {
  return engine.render(url, {
    waitFor: config.waitFor,
    debug: config.debug,
  });
}

/**
 * Map a route path to a file path and write the HTML.
 *
 * /             → outputDir/index.html
 * /about        → outputDir/about/index.html
 * /blog/post-1  → outputDir/blog/post-1/index.html
 *
 * @param {string} route
 * @param {string} html
 * @param {string} outputDir
 */
export async function saveHTML(route, html, outputDir) {
  const filePath =
    route === '/'
      ? path.join(outputDir, 'index.html')
      : path.join(outputDir, route.replace(/^\//, ''), 'index.html');

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}
