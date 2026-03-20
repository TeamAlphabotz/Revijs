// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from './config.js';
import { renderAllPages } from './prerender.js';

export async function runCLI() {
  const program = new Command();

  program
    .name('revijs')
    .version('0.3.0')
    .description('SPA prerender CLI');

  // render (default)
  program
    .command('render', { isDefault: true })
    .description('Prerender all routes from revi.config.js')
    .option('-c, --config <path>', 'Config file', 'revi.config.js')
    .option('-o, --output <dir>', 'Override output directory')
    .option('--debug', 'Verbose logging')
    .option('--no-cache', 'Skip cache, force re-render all')
    .action(async (opts) => {
      console.log(pc.cyan('\n  ReviJs v0.3.0\n'));
      try {
        const config = await loadConfig(opts.config, {
          outputDir: opts.output,
          debug: opts.debug ?? false,
          cache: opts.cache !== false,
        });

        if (config.sitemapInput) {
          const { routesFromSitemap } = await import('./utils/sitemap.js');
          console.log(pc.dim(`  Reading routes from: ${config.sitemapInput}`));
          config.routes = await routesFromSitemap(config.sitemapInput);
          console.log(pc.dim(`  Found ${config.routes.length} routes`));
        }

        if ((!config.routes || config.routes.length === 0) || config.autoDiscover) {
          const { discoverRoutes } = await import('./utils/route-discovery.js');
          console.log(pc.dim('  Auto-discovering routes...'));
          config.routes = await discoverRoutes(config.distDir);
          console.log(pc.dim(`  Discovered: ${config.routes.join(', ')}`));
        }

        // Support async routes function
        if (typeof config.routes === 'function') {
          console.log(pc.dim('  Resolving dynamic routes...'));
          config.routes = await config.routes();
        }

        await renderAllPages(config);
        console.log(pc.green('  Done.\n'));
      } catch (err) {
        console.error(pc.red(`\n  Error: ${err.message}\n`));
        if (opts.debug) console.error(err.stack);
        process.exit(1);
      }
    });

  // init
  program
    .command('init')
    .description('Create revi.config.js')
    .action(async () => {
      const { scaffoldConfig } = await import('./config.js');
      await scaffoldConfig();
    });

  // watch
  program
    .command('watch')
    .description('Re-render when dist/ changes')
    .option('-c, --config <path>', 'Config file', 'revi.config.js')
    .action(async (opts) => {
      const { watchMode } = await import('./watcher.js');
      const config = await loadConfig(opts.config);
      await watchMode(config);
    });

  // deploy
  program
    .command('deploy')
    .description('Deploy to netlify | vercel | cloudflare')
    .requiredOption('--target <n>', 'netlify | vercel | cloudflare')
    .option('-o, --output <dir>', 'Output directory', 'dist-prerendered')
    .action(async (opts) => {
      const { deploy } = await import('./deploy.js');
      await deploy(opts.target, opts.output);
    });

  // ui
  program
    .command('ui')
    .description('Open dashboard in browser')
    .option('-c, --config <path>', 'Config file', 'revi.config.js')
    .action(async (opts) => {
      const { startDashboard } = await import('./dashboard/server.js');
      const config = await loadConfig(opts.config);
      await startDashboard(config);
    });

  // report
  program
    .command('report')
    .description('Print last prerender report')
    .option('-o, --output <dir>', 'Output directory', 'dist-prerendered')
    .action(async (opts) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      try {
        const data = await fs.default.readFile(
          path.default.join(process.cwd(), opts.output, 'revi-report.json'), 'utf8'
        );
        const report = JSON.parse(data);
        console.log(pc.cyan('\n  Last Prerender Report'));
        console.log(pc.dim(`  Generated: ${report.generatedAt}`));
        console.log(`  Total: ${report.summary.total} | OK: ${pc.green(report.summary.ok)} | Failed: ${pc.red(report.summary.failed)}`);
        if (report.summary.avgScore) console.log(`  Avg SEO score: ${report.summary.avgScore}%`);
        console.log();
      } catch {
        console.log(pc.yellow('  No report found. Run npx revijs first.\n'));
      }
    });

  program.parse(process.argv);
}
