import { defineWranglerConfig } from 'wrangler/experimental-config';

export default defineWranglerConfig({
  types: {
    generate: false,
  },
  build: {
    // The root build: the library first (the site uses its dist/), then the registry and the site.
    command: 'pnpm -w build',
  },
  assetsDirectory: './dist',
});
