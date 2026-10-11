import { defineWranglerConfig } from 'wrangler/experimental-config';

export default defineWranglerConfig({
  types: {
    generate: false,
  },
  build: {
    command: 'pnpm build',
  },
  assetsDirectory: './dist',
});
