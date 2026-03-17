/**
 * Bot detector utility.
 *
 * Used by the optional Express/Polka middleware to determine whether an incoming
 * request should be served prerendered HTML or passed through to the normal SPA.
 */

/**
 * Known bot user-agent substrings.
 * Includes all major crawlers: search engines, AI agents, social previews, etc.
 */
const BOT_PATTERNS = [
  // ── Search engines ──────────────────────────────────────────────────────────
  'googlebot',
  'google-inspectiontool',
  'bingbot',
  'slurp',          // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',
  'ia_archiver',   // Alexa / Wayback Machine
  'mj12bot',
  'dotbot',
  'ahrefsbot',
  'semrushbot',
  'rogerbot',

  // ── AI / LLM crawlers ───────────────────────────────────────────────────────
  'gptbot',            // OpenAI
  'chatgpt-user',      // OpenAI browsing
  'claudebot',         // Anthropic
  'claude-web',        // Anthropic
  'perplexitybot',     // Perplexity AI
  'cohere-ai',
  'amazonbot',
  'applebot',
  'anthropic-ai',

  // ── Social / preview ────────────────────────────────────────────────────────
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'telegrambot',
  'whatsapp',
  'vkshare',
  'pinterest',
  'tumblr',
  'flipboard',

  // ── Generic signals ─────────────────────────────────────────────────────────
  'spider',
  'crawler',
  'scraper',
  'bot/',
  '+http',   // Most crawlers include a URL like +https://... in their UA
];

/**
 * Returns `true` if the given user-agent string belongs to a known bot/crawler.
 *
 * @param {string} userAgent
 * @returns {boolean}
 */
export function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

/**
 * Returns the matched bot pattern string (useful for logging), or null.
 *
 * @param {string} userAgent
 * @returns {string|null}
 */
export function detectBot(userAgent) {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.find((pattern) => ua.includes(pattern)) ?? null;
}
