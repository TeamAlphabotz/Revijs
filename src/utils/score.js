// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

export function scoreHTML(html, route) {
  const checks = [
    { name: 'Has <title>',          pass: /<title[^>]*>[^<]+<\/title>/i.test(html),              weight: 20 },
    { name: 'Has meta description', pass: /name=["']description["']/i.test(html),                weight: 15 },
    { name: 'Has og:title',         pass: /property=["']og:title["']/i.test(html),               weight: 10 },
    { name: 'Has og:description',   pass: /property=["']og:description["']/i.test(html),         weight: 10 },
    { name: 'Has og:image',         pass: /property=["']og:image["']/i.test(html),               weight: 10 },
    { name: 'Has h1',               pass: /<h1[\s>]/i.test(html),                                weight: 15 },
    { name: 'Images have alt',      pass: !/<img(?![^>]*\balt=)[^>]*>/i.test(html),              weight: 10 },
    { name: 'Has canonical link',   pass: /rel=["']canonical["']/i.test(html),                   weight: 5  },
    { name: 'Has lang attribute',   pass: /<html[^>]+lang=/i.test(html),                         weight: 5  },
  ];

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter(c => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earned / total) * 100);

  return {
    route,
    score,
    passed: checks.filter(c => c.pass).map(c => c.name),
    failed: checks.filter(c => !c.pass).map(c => c.name),
  };
}

export function printScoreReport(scores) {
  const { default: pc } = await import('picocolors').catch(() => ({ default: { green: s=>s, yellow: s=>s, red: s=>s, dim: s=>s, bold: s=>s } }));
  console.log('\n  SEO Score Report');
  console.log('  ' + '─'.repeat(48));
  for (const s of scores) {
    const color = s.score >= 80 ? pc.green : s.score >= 50 ? pc.yellow : pc.red;
    console.log(`  ${color(`${s.score}`.padStart(3))}%  ${s.route}`);
    if (s.failed.length > 0) {
      console.log(pc.dim(`       missing: ${s.failed.join(', ')}`));
    }
  }
  const avg = Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length);
  console.log('  ' + '─'.repeat(48));
  console.log(`  avg ${avg}%\n`);
}
