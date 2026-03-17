// setup.js
// ──────────────────────────────────────────────────────────────
// ReviJs Browser Engine Setup Script
// Copyright (c) 2026 AlphaBotz & Adarsh
// GitHub: https://github.com/TeamAlphabotz
// GitHub: https://github.com/utkarshdubey2008
// Telegram: @alter69x, @akanesakuramori
// This script ensures your system has the required browser engine
// for ReviJs prerendering
// ──────────────────────────────────────────────────────────────

import { execSync } from 'child_process';
import pc from 'picocolors';

console.log(pc.cyan('\n  ⚡ ReviJs — Setting up browser engine...\n'));

try {
  // Install system dependencies (Linux/Ubuntu)
  if (process.platform === 'linux') {
    console.log(pc.dim('  Installing system dependencies...'));
    execSync('npx playwright install-deps chromium', { stdio: 'inherit' });
  }

  // Install Chromium
  console.log(pc.dim('  Installing Chromium...'));
  execSync('npx playwright install chromium', { stdio: 'inherit' });

  console.log(pc.green('\n  ✔ ReviJs is ready! Run: npx revijs\n'));
} catch (err) {
  console.warn(pc.yellow('\n  Warning: Auto-setup failed. Run manually:'));
  console.warn(pc.yellow('  npx playwright install-deps chromium'));
  console.warn(pc.yellow('  npx playwright install chromium\n'));
}
