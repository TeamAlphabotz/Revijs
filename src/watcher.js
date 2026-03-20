// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { renderAllPages } from './prerender.js';

export async function watchMode(config) {
  console.log(pc.cyan('\n  ReviJs watch mode — watching dist/ for changes\n'));

  let running = false;

  async function run() {
    if (running) return;
    running = true;
    console.log(pc.dim('  Change detected — re-rendering...\n'));
    try {
      await renderAllPages(config);
    } catch (err) {
      console.error(pc.red(`  Error: ${err.message}`));
    }
    running = false;
  }

  // Initial render
  await run();

  const watchDir = path.resolve(process.cwd(), config.distDir);
  let debounce = null;

  fs.watch(watchDir, { recursive: true }, (event, filename) => {
    if (filename && filename.endsWith('.html')) {
      clearTimeout(debounce);
      debounce = setTimeout(run, 500);
    }
  });

  console.log(pc.dim(`  Watching: ${watchDir}`));
  console.log(pc.dim('  Press Ctrl+C to stop\n'));

  // Keep process alive
  process.stdin.resume();
}
