// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

export function injectMeta(html, route) {
  let modified = html;

  const hasTag = (name) =>
    modified.includes(`property="${name}"`) ||
    modified.includes(`name="${name}"`) ||
    modified.includes(`property='${name}'`);

  const titleMatch = modified.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : route;

  const h1Match = modified.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const description = h1Match ? h1Match[1].trim() : `Page at ${route}`;

  const imgMatch = modified.match(/<img[^>]+src=["']([^"']+)["']/i);
  const image = imgMatch ? imgMatch[1] : '';

  const tags = [];

  if (!hasTag('og:title')) tags.push(`<meta property="og:title" content="${escape(title)}" />`);
  if (!hasTag('og:description')) tags.push(`<meta property="og:description" content="${escape(description)}" />`);
  if (!hasTag('og:type')) tags.push(`<meta property="og:type" content="website" />`);
  if (image && !hasTag('og:image')) tags.push(`<meta property="og:image" content="${escape(image)}" />`);
  if (!hasTag('twitter:card')) tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  if (!hasTag('twitter:title')) tags.push(`<meta name="twitter:title" content="${escape(title)}" />`);

  if (tags.length > 0) {
    modified = modified.replace('</head>', `  ${tags.join('\n  ')}\n</head>`);
  }

  return modified;
}

function escape(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
