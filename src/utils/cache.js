// Copyright (c) 2026 AlphaBotz — https://github.com/TeamAlphabotz

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CACHE_FILE = '.revi-cache.json';

function hash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

export async function loadCache(outputDir) {
  try {
    const data = await fs.readFile(path.join(outputDir, CACHE_FILE), 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveCache(outputDir, cache) {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, CACHE_FILE), JSON.stringify(cache, null, 2));
}

export async function isCached(route, html, cache) {
  const h = hash(html);
  return cache[route] === h;
}

export function updateCache(route, html, cache) {
  cache[route] = hash(html);
  return cache;
}

export async function readCachedHTML(route, outputDir) {
  const filePath = route === '/'
    ? path.join(outputDir, 'index.html')
    : path.join(outputDir, route.replace(/^\//, ''), 'index.html');
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}
