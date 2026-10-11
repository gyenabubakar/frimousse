import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import astro from 'eslint-plugin-astro';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import checkFile from 'eslint-plugin-check-file';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import { localRules } from './eslint-rules/index.js';

// Parent-relative imports (../) hide the real location and break when files move.
const noParentRelativeImports = {
  group: ['..', '../**'],
  message:
    'Use a path alias instead of a parent-relative import (../): $lib, $components, $layouts, $styles or $site.',
};

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.svelte-kit/**',
      '**/.astro/**',
      '**/.wrangler/**',
      '**/.cloudflare/**',
      '**/.vitest/**',
      // Local AI tool data, such as temporary worktree copies of the repo.
      '.claude/**',
      'website/public/r/**',
      // Vendored shadcn-svelte components — re-fetched from upstream, not ours to restyle.
      'website/src/lib/components/ui/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
      },
    },
  },
  {
    files: ['frimousse/**'],
    rules: {
      // Ported from Liveblocks' Frimousse, which uses empty catches on purpose for best-effort storage.
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': false }],
    },
  },
  {
    // The house style. The library keeps the upstream code's style, so syncing with Frimousse stays easy.
    files: ['website/**', 'eslint-rules/**', '*.js'],
    plugins: { '@stylistic': stylistic },
    rules: {
      // Set a multi-line block (if/for/while/try/switch) apart with a blank line, so dense
      // control flow reads as distinct groups.
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-block-like' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'func-style': ['error', 'declaration'],
      'object-shorthand': ['error', 'always', { avoidExplicitReturnArrows: true }],
      'no-nested-ternary': 'error',
      'max-params': ['error', { max: 3 }],
      'no-var': 'error',
      'prefer-const': 'error',
      // Favour early return/guard clauses: an else after a return is dead indentation.
      'no-else-return': ['error', { allowElseIf: false }],
      // A control body that wraps onto its own line MUST be braced. Inline guards stay brace-free.
      curly: ['error', 'multi-line'],
      // Expressive names over shorthand: no single-letter identifiers, no known abbreviations.
      'id-length': ['error', { min: 2, properties: 'never', exceptions: ['_', '$'] }],
      'id-denylist': [
        'error',
        'e',
        'msg',
        'req',
        'res',
        'err',
        'idx',
        'ctx',
        'tmp',
        'buf',
        'val',
        'arr',
        'obj',
        'fn',
        'cb',
        'el',
        'ev',
        'cur',
        'prev',
        'acc',
      ],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': false, 'ts-ignore': 'allow-with-description' },
      ],
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    plugins: { local: localRules },
    rules: {
      'prefer-const': 'off',
      'svelte/prefer-const': 'error',
      'svelte/prefer-svelte-reactivity': 'off',
      'svelte/require-each-key': 'warn',
      'local/rune-order': 'error',
    },
  },
  {
    files: ['website/src/**/*.{ts,astro,svelte}', 'eslint-rules/**/*.js'],
    plugins: { local: localRules },
    rules: {
      'local/max-consecutive-statements': ['error', { max: 5 }],
      'local/switch-case-padding': ['error', { minCases: 3 }],
      'local/padding-before-final-return': ['error', { minStatements: 5 }],
    },
  },
  {
    // This config uses ESLint's required `prev`/`next` selector keys (padding rule),
    // which id-denylist would otherwise flag — they're an external API, not our naming.
    files: ['eslint.config.js'],
    rules: { 'id-denylist': 'off' },
  },
  {
    files: ['website/src/**/*.{astro,svelte,ts}'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'website/src/styles/global.css',
        callees: ['cn', 'clsx', 'tv', 'cva', 'twMerge'],
        rootFontSize: 16,
      },
    },
    rules: {
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/enforce-consistent-important-position': 'error',
      'better-tailwindcss/enforce-consistent-variable-syntax': 'error',
      'better-tailwindcss/enforce-canonical-classes': 'error',
    },
  },
  {
    files: ['**/*.{js,mjs,ts,astro,svelte}'],
    // Route files named by Astro's conventions: dynamic params and status pages.
    ignores: ['website/src/pages/**/\\[*', 'website/src/pages/404.astro', '**/__tests__/**'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { '**/': 'KEBAB_CASE' }],
    },
  },
  {
    files: ['website/src/**/*.{ts,astro,svelte}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [noParentRelativeImports] }],
    },
  },
);
