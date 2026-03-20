// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

export function reviPlugin(options = {}) {
  return {
    name: 'revijs',
    apply: 'build',
    async closeBundle() {
      const { loadConfig } = await import('./config.js');
      const { renderAllPages } = await import('./prerender.js');

      console.log('\n[revijs] Starting prerender...\n');

      try {
        const config = await loadConfig('revi.config.js', options);
        await renderAllPages(config);
        console.log('\n[revijs] Prerender complete.\n');
      } catch (err) {
        console.error(`\n[revijs] Prerender failed: ${err.message}\n`);
      }
    },
  };
}
