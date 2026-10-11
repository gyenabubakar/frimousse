const scopes = [
  // library
  'picker',
  'data',
  'tests',
  // site areas
  'website',
  'docs',
  'demos',
  'registry',
  'toc',
  'theme',
  // cross-cutting
  'deploy',
  'release',
  'deps',
  'repo',
  'tooling',
  'ci',
];

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 120],
    'scope-enum': [2, 'always', scopes],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};
