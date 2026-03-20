// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import fs from 'fs/promises';
import path from 'path';

export async function saveReport(results, outputDir) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: results.ok + results.failed,
      ok: results.ok,
      failed: results.failed,
      avgScore: results.scores.length
        ? Math.round(results.scores.reduce((s, r) => s + r.score, 0) / results.scores.length)
        : null,
    },
    routes: results.renderTimes.map(({ route, ms }) => {
      const score = results.scores.find(s => s.route === route);
      return {
        route,
        ms,
        score: score ? score.score : null,
        passed: score ? score.passed : [],
        failed: score ? score.failed : [],
      };
    }),
    errors: results.errors || [],
  };

  const dest = path.join(outputDir, 'revi-report.json');
  await fs.writeFile(dest, JSON.stringify(report, null, 2));
  return dest;
}
