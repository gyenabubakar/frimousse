import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
          setupFiles: ['test/setup-emojibase.ts'],
        },
      },
      {
        extends: true,
        // Compile components for the server, like SvelteKit and Astro do when rendering a page.
        resolve: { conditions: ['svelte', 'node'] },
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.test.server.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.test.browser.ts'],
          setupFiles: ['test/setup-emojibase.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
