// @ts-check

/** @type {import('prettier').Config} */
const config = {
  arrowParens: 'always',
  bracketSpacing: true,
  quoteProps: 'as-needed',
  singleQuote: true,
  semi: true,
  printWidth: 100,
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'all',
  // prettier-plugin-tailwindcss must come last so it can wrap the other plugins' parsers.
  plugins: [
    'prettier-plugin-astro',
    'prettier-plugin-svelte',
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  tailwindStylesheet: './website/src/styles/global.css',
  overrides: [
    { files: '*.astro', options: { parser: 'astro' } },
    { files: '*.svelte', options: { parser: 'svelte' } },
  ],
  importOrder: [
    '^astro(:.+|/.+)?$',
    '^svelte(/.+)?$',
    '<THIRD_PARTY_MODULES>',
    '^~icons/',
    '<TYPES>^astro(:.+|/.+)?$',
    '<TYPES><THIRD_PARTY_MODULES>',
    '<TYPES>',
    '^\\$',
    '<TYPES>^\\$',
    '^[.]',
    '<TYPES>^[.]',
    '',
  ],
};

export default config;
