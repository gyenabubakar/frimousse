import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test as base, expect } from '@playwright/test';

const require = createRequire(import.meta.url);
const EMOJIBASE_FILE = /emojibase-data@[^/]+\/([\w-]+)\/(data|messages)\.json$/;

/**
 * Serves the Emojibase files the picker fetches from the CDN out of the local `emojibase-data` package, so the
 * tests don't depend on the network. Also fails the test on any page error or console error.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });

      await page.route('https://cdn.jsdelivr.net/npm/**', async (route) => {
        const match = route.request().url().match(EMOJIBASE_FILE);

        if (!match) return route.abort();

        const [, locale, file] = match;
        const path = require.resolve(`emojibase-data/${locale}/${file}.json`);
        const headers = { etag: `"${locale}-${file}"`, 'access-control-allow-origin': '*' };

        if (route.request().method() === 'HEAD') return route.fulfill({ status: 200, headers });

        await route.fulfill({
          status: 200,
          headers,
          contentType: 'application/json',
          body: await readFile(path, 'utf8'),
        });
      });

      await use(errors);
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
