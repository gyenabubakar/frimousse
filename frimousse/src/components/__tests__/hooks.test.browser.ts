import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import HooksPage from './hooks-page.svelte';

describe('useActiveEmoji', () => {
  it('should follow the hovered emoji and reset when the pointer leaves', async () => {
    await render(HooksPage);

    await expect.element(page.getByTestId('hook-active-emoji')).toHaveTextContent('none');

    await page.getByRole('gridcell', { name: 'Grinning face', exact: true }).hover();
    await expect.element(page.getByTestId('hook-active-emoji')).toHaveTextContent('Grinning face');

    await page.getByTestId('bound-skin-tone').hover();
    await expect.element(page.getByTestId('hook-active-emoji')).toHaveTextContent('none');
  });

  it('should throw outside EmojiPicker.Root', async () => {
    await expect(render(HooksPage, { withRoot: false })).rejects.toThrow(
      'EmojiPicker.Root is missing.',
    );
  });
});

describe('useSkinTone', () => {
  it('should return the variations of ✋ by default', async () => {
    await render(HooksPage);

    await expect
      .element(page.getByTestId('hook-variations'))
      .toHaveTextContent('✋ ✋🏻 ✋🏼 ✋🏽 ✋🏾 ✋🏿');
  });

  it('should follow a changing emoji', async () => {
    const { rerender } = await render(HooksPage, { emoji: '👋' });

    await expect
      .element(page.getByTestId('hook-variations'))
      .toHaveTextContent('👋 👋🏻 👋🏼 👋🏽 👋🏾 👋🏿');

    await rerender({ emoji: '👍' });

    await expect
      .element(page.getByTestId('hook-variations'))
      .toHaveTextContent('👍 👍🏻 👍🏼 👍🏽 👍🏾 👍🏿');
  });

  it('should change the skin tone of the picker and its bound value', async () => {
    await render(HooksPage);

    await expect.element(page.getByTestId('hook-skin-tone')).toHaveTextContent('none');

    await page.getByTestId('hook-set-dark').click();

    await expect.element(page.getByTestId('hook-skin-tone')).toHaveTextContent('dark');
    await expect.element(page.getByTestId('bound-skin-tone')).toHaveTextContent('dark');
    await expect.element(page.getByTestId('skin-tone-selector')).toHaveTextContent('✋🏿');
  });

  it('should follow changes from the skin tone selector', async () => {
    await render(HooksPage);

    await page.getByTestId('skin-tone-selector').click();

    await expect.element(page.getByTestId('hook-skin-tone')).toHaveTextContent('light');
    await expect.element(page.getByTestId('bound-skin-tone')).toHaveTextContent('light');
  });
});
