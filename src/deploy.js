// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import { execSync } from 'child_process';
import pc from 'picocolors';

const ADAPTERS = {
  netlify: {
    check: 'netlify',
    cmd: (dir) => `netlify deploy --dir=${dir} --prod`,
    install: 'npm install -g netlify-cli',
  },
  vercel: {
    check: 'vercel',
    cmd: (dir) => `vercel ${dir} --prod`,
    install: 'npm install -g vercel',
  },
  cloudflare: {
    check: 'wrangler',
    cmd: (dir) => `wrangler pages deploy ${dir}`,
    install: 'npm install -g wrangler',
  },
};

export async function deploy(target, outputDir) {
  const adapter = ADAPTERS[target];

  if (!adapter) {
    console.error(pc.red(`  Unknown deploy target: "${target}"`));
    console.log(`  Available: ${Object.keys(ADAPTERS).join(', ')}`);
    process.exit(1);
  }

  console.log(pc.cyan(`\n  Deploying to ${target}...\n`));

  try {
    execSync(`${adapter.check} --version`, { stdio: 'ignore' });
  } catch {
    console.error(pc.red(`  ${adapter.check} CLI not found.`));
    console.log(pc.dim(`  Install it: ${adapter.install}`));
    process.exit(1);
  }

  try {
    execSync(adapter.cmd(outputDir), { stdio: 'inherit' });
    console.log(pc.green(`\n  Deployed to ${target} successfully.\n`));
  } catch (err) {
    console.error(pc.red(`\n  Deploy failed: ${err.message}\n`));
    process.exit(1);
  }
}
