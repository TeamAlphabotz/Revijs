// Copyright (c) 2026 AlphaBotz & Adarsh
// GitHub: https://github.com/TeamAlphabotz
// GitHub: https://github.com/utkarshdubey2008
// Telegram: @alter69x, @akanesakuramori

import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from './config.js';
import { renderAllPages } from './prerender.js';

const pkg = { name: 'revijs', version: '0.1.0' };

export async function runCLI() {
  const program = new Command();

  program
    .name(pkg.name)
    .version(pkg.version)
    .description('Local-first SPA prerender CLI — converts your built app into static HTML');

  // ─── Default command: prerender ──────────────────────────────────────────────
  program
    .command('render', { isDefault: true })
    .description('Prerender all routes defined in revi.config.js')
    .option('-c, --config <path>', 'Path to config file', 'revi.config.js')
    .option('-o, --output <dir>', 'Override output directory')
    .option('--debug', 'Enable verbose debug logging')
    .action(async (options) => {
      console.log(pc.cyan('\n  ⚡ ReviJs — SPA Prerenderer\n'));

      try {
        const config = await loadConfig(options.config, {
          outputDir: options.output,
          debug: options.debug ?? false,
        });

        await renderAllPages(config);

        console.log(pc.green('\n  ✔ Prerender complete!\n'));
      } catch (err) {
        console.error(pc.red(`\n  ✖ Error: ${err.message}\n`));
        if (options.debug) console.error(err.stack);
        process.exit(1);
      }
    });

  // ─── init: scaffold config file ─────────────────────────────────────────────
  program
    .command('init')
    .description('Create a starter revi.config.js in the current directory')
    .action(async () => {
      const { scaffoldConfig } = await import('./config.js');
      await scaffoldConfig();
    });

  program.parse(process.argv);
}
