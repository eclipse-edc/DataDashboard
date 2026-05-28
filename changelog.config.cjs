'use strict';

module.exports = {
  preset: {
    name: 'conventionalcommits',
    types: [
      { type: 'feat', section: 'Features' },
      { type: 'fix', section: 'Bug Fixes' },
      { type: 'perf', section: 'Performance Improvements' },
      { type: 'revert', section: 'Reverts' },
      { type: 'chore', section: 'Chores' },
      { type: 'refactor', section: 'Refactoring' },
      { type: 'docs', hidden: true },
      { type: 'style', hidden: true },
      { type: 'test', hidden: true },
      { type: 'build', hidden: true },
      { type: 'ci', hidden: true },
    ],
  },
};
