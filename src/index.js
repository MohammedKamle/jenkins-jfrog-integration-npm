#!/usr/bin/env node
/**
 * Simple demo app that uses lodash to demonstrate building and publishing
 * npm artifacts to JFrog Artifactory via Jenkins.
 */

const _ = require('lodash');

const pkg = require('../package.json');

function joinWords(...words) {
  return _.join(words, ' ');
}

function capitalizeWords(...words) {
  return _.map(words, (w) => _.capitalize(w)).join(' ');
}

function main() {
  console.log(`Starting ${pkg.name} v${pkg.version}...`);

  const joined = joinWords('Hello', 'JFrog', 'Artifactory');
  console.log('Lodash join result:', joined);

  const capitalized = capitalizeWords('build', 'and', 'publish');
  console.log('Capitalized words:', capitalized);

  console.log(`${pkg.name} v${pkg.version} finished successfully!`);
}

if (require.main === module) {
  main();
} else {
  module.exports = { joinWords, capitalizeWords };
}
