// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import path from 'path';
import fs from 'fs/promises';
import { pathToFileURL } from 'url';
import pc from 'picocolors';

const DEFAULTS = {
  routes: ['/'],
  engine: 'browser',
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  waitFor: 1200,
  readyFlag: false,
  waitForSelector: null,
  headless: true,
  port: 4173,
  debug: false,
  injectMeta: true,
  score: true,
  sitemap: false,
  parallel: 1,
};

export async function loadConfig(configPath = 'revi.config.js', overrides = {}) {
  const absPath = path.resolve(process.cwd(), configPath);
  let userConfig = {};

  try {
    await fs.access(absPath);
    const mod = await import(pathToFileURL(absPath).href);
    userConfig = mod.default ?? mod;
    console.log(pc.dim(`  Config: ${configPath}`));
  } catch {
    console.warn(pc.yellow(`  No config found at "${configPath}" — using defaults.`));
  }

  const config = { ...DEFAULTS, ...userConfig, ...filterDefined(overrides) };
  validateConfig(config);
  config.outputDir = path.resolve(process.cwd(), config.outputDir);
  config.distDir = path.resolve(process.cwd(), config.distDir);
  return config;
}

export async function scaffoldConfig() {
  const dest = path.resolve(process.cwd(), 'revi.config.js');
  try {
    await fs.access(dest);
    console.log(pc.yellow('  revi.config.js already exists.'));
    return;
  } catch {}

  await fs.writeFile(dest, `// revi.config.js
export default {
  routes: ['/', '/about', '/blog/post-1'],
  engine: 'browser',
  outputDir: 'dist-prerendered',
  distDir: 'dist',
  waitFor: 1200,
  readyFlag: false,
  waitForSelector: null,
  headless: true,
  port: 4173,
  injectMeta: true,
  score: true,
  sitemap: false,
  parallel: 1,
};
`);
  console.log(pc.green('  Created revi.config.js'));
}

function validateConfig(config) {
  if (!Array.isArray(config.routes) || config.routes.length === 0) {
    throw new Error('config.routes must be a non-empty array.');
  }
  if (!['browser', 'advanced', 'ssr'].includes(config.engine)) {
    throw new Error(`config.engine must be browser | advanced | ssr. Got: "${config.engine}"`);
  }
  if (typeof config.waitFor !== 'number' || config.waitFor < 0) {
    throw new Error('config.waitFor must be a non-negative number.');
  }
}

function filterDefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));
}
