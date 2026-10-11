export default {
  '*.{js,mjs,ts,astro,svelte}': [
    'eslint --fix --cache --cache-location node_modules/.cache/eslint/',
    'prettier --cache --log-level error --write',
  ],
  '*.{json,jsonc,md,css,html,yaml,yml}': ['prettier --cache --log-level error --write'],
};
