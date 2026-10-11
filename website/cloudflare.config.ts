import { defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'frimousse',
    compatibilityDate: '2026-09-26',
  },
});
