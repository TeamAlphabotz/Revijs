// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from './config.js';
import { renderAllPages } from './prerender.js';

export async function runCLI() {
  const program = new Command();

  program
    .name('revijs')
    .version('0.2.0')
    .description('SPA prerender CLI');

  // render (default)
  program
    .command('render', { isDefault: true })
    .description('Prerender all routes from revi.config.js')
    .option('-c, --config <path>', 'Config file path', 'revi.config.js')
    .option('-o, --output <dir>', 'Override output directory')
    .option('--debug', 'Verbose logging')
    .action(async (opts) => {
      console.log(pc.cyan('\n  ReviJs v0.2.0\n'));
      try {
        const config = await loadConfig(opts.config, {
          outputDir: opts.output,
          debug: opts.debug ?? false,
        });

        // Handle sitemap ingestion as route source
        if (config.sitemapInput) {
          const { routesFromSitemap } = await import('./utils/sitemap.js');
          console.log(pc.dim(`  Reading routes from sitemap: ${config.sitemapInput}`));
          config.routes = await routesFromSitemap(config.sitemapInput);
          console.log(pc.dim(`  Found ${config.routes.length} routes`));
        }

        // Auto route discovery if routes not set
        if (!config.routes || config.routes.length === 0 || config.autoDiscover) {
          const { discoverRoutes } = await import('./utils/route-discovery.js');
          console.log(pc.dim('  Auto-discovering routes...'));
          config.routes = await discoverRoutes(config.distDir);
          console.log(pc.dim(`  Discovered: ${config.routes.join(', ')}`));
        }

        await renderAllPages(config);
        console.log(pc.green('\n  Done.\n'));
      } catch (err) {
        console.error(pc.red(`\n  Error: ${err.message}\n`));
        if (opts.debug) console.error(err.stack);
        process.exit(1);
      }
    });

  // init
  program
    .command('init')
    .description('Create revi.config.js in current directory')
    .action(async () => {
      const { scaffoldConfig } = await import('./config.js');
      await scaffoldConfig();
    });

  // deploy
  program
    .command('deploy')
    .description('Deploy prerendered output to a hosting provider')
    .requiredOption('--target <name>', 'netlify | vercel | cloudflare')
    .option('-o, --output <dir>', 'Output directory', 'dist-prerendered')
    .action(async (opts) => {
      const { deploy } = await import('./deploy.js');
      await deploy(opts.target, opts.output);
    });

  // ui - dashboard
  program
    .command('ui')
    .description('Open dashboard UI in browser')
    .option('-c, --config <path>', 'Config file path', 'revi.config.js')
    .action(async (opts) => {
      const { startDashboard } = await import('./dashboard/server.js');
      const config = await loadConfig(opts.config);
      await startDashboard(config);
    });

  program.parse(process.argv);
}
