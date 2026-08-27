import test from 'node:test';
import assert from 'node:assert/strict';

import { models, recommendModel } from '../app.mjs';

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
