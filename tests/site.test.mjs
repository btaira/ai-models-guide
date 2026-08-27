import test from 'node:test';
import assert from 'node:assert/strict';

import * as guide from '../app.mjs';

const { models, recommendModel } = guide;

test('link audit includes generated model links and detects missing page anchors', async () => {
  let audit;
  try {
    audit = await import('../scripts/check-links.mjs');
  } catch {
    audit = {};
  }

  assert.equal(typeof audit.collectLinks, 'function');
  assert.equal(typeof audit.findMissingAnchors, 'function');

  const html = '<link rel="preconnect" href="https://fonts.example"><a href="#models">Models</a><a href="https://example.com/method">Method</a><section id="models"></section>';
  const fixtureModels = [{
    primaryUrl: 'https://example.com/primary',
    corpusUrl: 'https://example.com/corpus',
    researchUrl: 'https://example.com/research',
    aaUrl: 'https://example.com/score'
  }];

  assert.deepEqual(audit.collectLinks(html, fixtureModels), [
    '#models',
    'https://example.com/method',
    'https://example.com/primary',
    'https://example.com/corpus',
    'https://example.com/research',
    'https://example.com/score'
  ]);
  assert.deepEqual(audit.findMissingAnchors(html), []);
  assert.deepEqual(audit.findMissingAnchors('<a href="#missing">Missing</a>'), ['#missing']);
});

test('advisor exposes every requirement as a visible button', () => {
  assert.equal(typeof guide.renderAdvisorChoices, 'function');

  const markup = guide.renderAdvisorChoices();
  const buttonCount = (markup.match(/<button\b/g) ?? []).length;

  assert.equal(buttonCount, 8);
  assert.doesNotMatch(markup, /<select\b/);
  for (const priority of [
    'knowledge-work',
    'coding',
    'provenance',
    'open-frontier',
    'open-engineering',
    'multilingual',
    'multimodal',
    'budget'
  ]) {
    assert.match(markup, new RegExp(`data-priority="${priority}"`));
  }
});

test('provenance research selects a model with an inspectable corpus', () => {
  const result = recommendModel('provenance');

  assert.equal(result.id, 'olmo-3');
  assert.equal(result.transparency, 'Full corpus');
  assert.match(result.corpusUrl, /^https:\/\//);
});

test('frontier open-weight work selects the strongest independently benchmarked option', () => {
  const result = recommendModel('open-frontier');

  assert.equal(result.id, 'kimi-k3');
  assert.equal(result.aaScore, 57);
});

test('agentic knowledge work selects the current independent leader', () => {
  const result = recommendModel('knowledge-work');

  assert.equal(result.id, 'claude-opus-5');
  assert.equal(result.aaScore, 61);
});

test('a full-corpus claim always provides a corpus or reconstruction link', () => {
  const transparentModels = models.filter((model) => model.transparency === 'Full corpus');

  assert.ok(transparentModels.length >= 2);
  for (const model of transparentModels) {
    assert.match(model.corpusUrl, /^https:\/\//, model.name + ' is missing a corpus link');
  }
});

test('every model distinguishes evidence from inference and cites a primary source', () => {
  assert.ok(models.length >= 10);
  for (const model of models) {
    assert.ok(['Full corpus', 'Categories only', 'Minimal disclosure'].includes(model.transparency));
    assert.match(model.primaryUrl, /^https:\/\//, model.name + ' is missing a primary source');
    assert.ok(model.evidenceNote.length > 20, model.name + ' needs an evidence note');
  }
});
