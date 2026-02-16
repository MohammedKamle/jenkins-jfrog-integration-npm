/**
 * Unit tests for the demo app (Node built-in test runner).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { joinWords, capitalizeWords } = require('./index.js');

describe('joinWords', () => {
  it('joins multiple words with space', () => {
    assert.strictEqual(joinWords('Hello', 'JFrog', 'Artifactory'), 'Hello JFrog Artifactory');
  });

  it('returns single word as-is', () => {
    assert.strictEqual(joinWords('Hello'), 'Hello');
  });
});

describe('capitalizeWords', () => {
  it('capitalizes each word', () => {
    assert.strictEqual(capitalizeWords('build', 'and', 'publish'), 'Build And Publish');
  });

  it('handles already capitalized words', () => {
    assert.strictEqual(capitalizeWords('Already', 'Done'), 'Already Done');
  });
});
