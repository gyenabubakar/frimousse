import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

/** A demo on the page, by its `data-demo` name (see demo-frame.astro). */
function demo(page: Page, name: string): Locator {
  return page.locator(`[data-demo="${name}"]`);
}

/**
 * Scrolls a demo into view and waits until it runs. Demos below the fold load when they become visible
 * (`client:visible`); Astro removes the island's `ssr` attribute once the component has hydrated.
 */
async function openDemo(page: Page, name: string): Promise<Locator> {
  const frame = demo(page, name);

  await frame.scrollIntoViewIfNeeded();
  await expect(frame.locator('astro-island').first()).not.toHaveAttribute('ssr');

  return frame;
}

test.describe('hero demo', () => {
  test('searches, selects with the mouse, and selects with the keyboard', async ({ page }) => {
    await page.goto('/');

    const hero = await openDemo(page, 'hero');
    const selected = page.getByTestId('hero-selected');

    await expect(hero.getByRole('gridcell', { name: 'Grinning face', exact: true })).toBeVisible();

    await hero.getByRole('gridcell', { name: 'Grinning face', exact: true }).click();
    await expect(selected).toHaveText('😀');

    await hero.getByRole('searchbox').fill('cat');
    await expect(hero.getByRole('gridcell', { name: 'Grinning cat', exact: true })).toBeVisible();
    await expect(hero.getByRole('gridcell', { name: 'Grinning face', exact: true })).toHaveCount(0);

    // Typing makes the first result active (shown in the footer); down moves to the second row.
    const footer = hero.locator('[data-slot="emoji-picker-footer"]');

    await expect(footer).toHaveText('😺 Grinning cat');
    await page.keyboard.press('ArrowDown');
    await expect(footer).not.toHaveText('😺 Grinning cat');
    await page.keyboard.press('Enter');
    await expect(selected).not.toHaveText('😀');
    await expect(selected).toHaveText(/^😀.+$/u);
  });

  test('shows the empty state for a search without results', async ({ page }) => {
    await page.goto('/');

    const hero = await openDemo(page, 'hero');

    await hero.getByRole('searchbox').fill('zzzzzz');
    await expect(hero.getByText('No emoji found.')).toBeVisible();
  });

  test('scrolls through every category with sticky headers', async ({ page }) => {
    await page.goto('/');

    const viewport = (await openDemo(page, 'hero')).locator('[frimousse-viewport]');

    await expect(viewport.getByRole('gridcell').first()).toBeVisible();
    await viewport.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));

    await expect(viewport.getByRole('gridcell', { name: /^Flag: / }).first()).toBeVisible();

    const stuckHeader = await viewport.evaluate((element) => {
      const top = element.getBoundingClientRect().top;
      const headers = element.querySelectorAll<HTMLElement>(
        // Leaves out the hidden header Frimousse renders only to measure the height.
        '[frimousse-category] > [frimousse-category-header]',
      );

      return [...headers].find((header) => {
        const rect = header.getBoundingClientRect();

        return rect.top <= top + 1 && rect.bottom > top;
      })?.textContent;
    });

    expect(stuckHeader?.trim()).toBe('Flags');
  });
});

test.describe('options demo', () => {
  test('changes the locale and the number of columns', async ({ page }) => {
    await page.goto('/');

    const options = await openDemo(page, 'options');

    await options.getByRole('combobox').first().selectOption('fr');
    await expect(options.getByText('Smileys et émotion').first()).toBeVisible();

    await options.getByRole('slider').fill('7');
    await expect(options.locator('[frimousse-list]')).toHaveAttribute('aria-colcount', '7');
    await expect(options.getByRole('row').first().getByRole('gridcell')).toHaveCount(7);
  });

  test('keeps bind:skinTone and the skin tone button in sync', async ({ page }) => {
    await page.goto('/');

    const options = await openDemo(page, 'options');
    const select = options.getByRole('combobox').nth(1);
    const button = options.locator('[frimousse-skin-tone-selector]');

    await button.click();
    await expect(select).toHaveValue('light');

    await select.selectOption('dark');
    await expect(button).toHaveText('✋🏿');
  });
});

test.describe('popover demo', () => {
  test('opens, picks an emoji, and closes', async ({ page }) => {
    await page.goto('/');

    const frame = await openDemo(page, 'popover');

    await frame.getByRole('button', { name: 'Open emoji picker' }).click();

    // Bits UI marks the popover content with this attribute (it has no dialog role).
    const popover = page.locator('[data-popover-content]');

    await popover.getByRole('gridcell', { name: 'Grinning face', exact: true }).click();
    await expect(popover).toBeHidden();
    await expect(page.getByTestId('popover-picked')).toHaveText('😀');
  });
});

test.describe('custom skin tone demo', () => {
  test('applies the chosen skin tone to the list', async ({ page }) => {
    await page.goto('/');

    const custom = await openDemo(page, 'custom-skin-tone');

    await custom.getByRole('searchbox').fill('waving hand');
    await expect(custom.getByRole('gridcell', { name: 'Waving hand' })).toHaveText('👋');

    await custom.getByRole('button', { name: 'Use the dark skin tone' }).click();
    await expect(custom.getByRole('gridcell', { name: 'Waving hand' })).toHaveText('👋🏿');
  });
});

test.describe('site', () => {
  test('toggles and remembers the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const html = page.locator('html');

    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Toggle dark mode' }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test('marks the section being read in the table of contents', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The table of contents is hidden on small screens.');
    await page.goto('/');

    await page.locator('#emojipicker\\.list').scrollIntoViewIfNeeded();
    await page.evaluate(() =>
      document.getElementById('emojipicker.list')?.scrollIntoView({ block: 'start' }),
    );

    await expect(page.locator('[data-toc="emojipicker.list"]')).toHaveAttribute('data-active', '');
  });

  test('has the GitHub and npm links', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/gyenabubakar/frimousse',
    );
    await expect(page.getByRole('link', { name: 'npm' })).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/@gyen/frimousse',
    );
  });

  test('shows the shadcn-svelte command for the live site', async ({ page }) => {
    await page.goto('/');

    await expect(
      page
        .getByText('npx shadcn-svelte@latest add https://frimousse.gyen.dev/r/emoji-picker.json')
        .first(),
    ).toBeAttached();
  });

  test('has a share image', async ({ page, request }) => {
    await page.goto('/');

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://frimousse.gyen.dev/og.png',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );

    const image = await request.get('/og.png');

    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toBe('image/png');
  });
});

test.describe('shadcn-svelte registry', () => {
  test('serves the emoji-picker item', async ({ request }) => {
    const response = await request.get('/r/emoji-picker.json');

    expect(response.ok()).toBe(true);

    const item = await response.json();

    expect(item).toMatchObject({
      name: 'emoji-picker',
      type: 'registry:ui',
      dependencies: ['@gyen/frimousse', 'phosphor-svelte'],
    });
    expect(item.files.map((file: { target: string }) => file.target)).toEqual([
      'emoji-picker/emoji-picker.svelte',
      'emoji-picker/emoji-picker-search.svelte',
      'emoji-picker/emoji-picker-content.svelte',
      'emoji-picker/emoji-picker-footer.svelte',
      'emoji-picker/index.ts',
    ]);

    for (const file of item.files) {
      expect(file.content).not.toContain('$lib/');
    }
  });
});
