/**
 * Route expander.
 *
 * Handles route list pre-processing:
 *   - Deduplication
 *   - Basic normalization (ensure leading slash)
 *   - Future: glob / wildcard expansion, sitemap parsing
 */

/**
 * Expand and normalize an array of route strings.
 *
 * Currently performs:
 *   - Trim whitespace
 *   - Ensure leading slash
 *   - Deduplicate
 *   - Sort for deterministic output order
 *
 * @param {string[]} routes
 * @returns {Promise<string[]>}
 */
export async function expandRoutes(routes) {
  const normalized = routes
    .map((r) => {
      r = r.trim();
      if (!r.startsWith('/')) r = '/' + r;
      // Remove trailing slash (except root)
      if (r !== '/' && r.endsWith('/')) r = r.slice(0, -1);
      return r;
    })
    .filter(Boolean);

  // Deduplicate
  const unique = [...new Set(normalized)];

  // Stable sort: root first, then alphabetical
  unique.sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });

  return unique;
}

/**
 * Future: parse a sitemap.xml and extract all <loc> entries as routes.
 *
 * @param {string} sitemapUrl
 * @returns {Promise<string[]>}
 */
export async function routesFromSitemap(sitemapUrl) {
  const { default: fetch } = await import('node-fetch');
  const res = await fetch(sitemapUrl);
  const xml = await res.text();

  const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
  const urls = Array.from(matches, (m) => m[1].trim());

  // Convert absolute URLs → relative paths
  return urls.map((u) => {
    try {
      return new URL(u).pathname;
    } catch {
      return u;
    }
  });
}
