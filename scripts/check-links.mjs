import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { models, foundationalModels } from '../app.mjs';

const modelUrlFields = ['primaryUrl', 'corpusUrl', 'researchUrl', 'aaUrl'];

export function collectLinks(html, modelEntries = []) {
  const links = [];
  const seen = new Set();
  const add = (value) => {
    if (!value || value.startsWith('data:') || seen.has(value)) return;
    seen.add(value);
    links.push(value);
  };

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) add(match[1]);
  for (const model of modelEntries) {
    for (const field of modelUrlFields) add(model[field]);
  }

  return links;
}

export function findMissingAnchors(html) {
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));
  return collectLinks(html)
    .filter((link) => link.startsWith('#') && link.length > 1)
    .filter((link) => !ids.has(decodeURIComponent(link.slice(1))));
}

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; AIModelEvidenceGuide-LinkAudit/1.0)',
      accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8'
    },
    signal: AbortSignal.timeout(20_000)
  });
  await response.body?.cancel();
  return response;
}

export async function checkUrl(url) {
  let lastError;
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await request(url, method);
      if (response.ok) {
        return { url, ok: true, status: response.status, finalUrl: response.url };
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
  }
  return { url, ok: false, error: lastError };
}

async function run() {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const links = collectLinks(html, [...models, ...foundationalModels]);
  const missingAnchors = findMissingAnchors(html);
  const externalLinks = links.filter((link) => /^https?:\/\//i.test(link));
  const results = await Promise.all(externalLinks.map(checkUrl));

  for (const result of results) {
    const detail = result.ok ? `${result.status} ${result.finalUrl}` : result.error;
    console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.url} -> ${detail}`);
  }
  for (const anchor of missingAnchors) console.log(`FAIL ${anchor} -> missing page target`);

  const failed = results.filter((result) => !result.ok).length + missingAnchors.length;
  console.log(`\n${externalLinks.length} external links checked; ${missingAnchors.length} missing anchors; ${failed} failures.`);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await run();
}
