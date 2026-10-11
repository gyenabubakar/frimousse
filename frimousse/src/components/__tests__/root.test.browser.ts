import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DefaultPage from './default-page.svelte';
import type { EmojiData, EmojiDataResolver } from '../../types.js';

const DATA: EmojiData = {
  locale: 'ne',
  categories: [{ index: 0, label: 'अनुहारहरू' }],
  skinTones: { light: '🏻', 'medium-light': '🏼', medium: '🏽', 'medium-dark': '🏾', dark: '🏿' },
  emojis: [{ emoji: '😀', category: 0, label: 'हाँसेको अनुहार', version: 1, tags: [] }],
};

describe('EmojiPicker.Root data loading', () => {
  it('should pass the locale and source options to the resolver', async () => {
    const resolve = vi.fn<EmojiDataResolver>(() => DATA);

    await render(DefaultPage, { locale: 'ne', emojiVersion: 5, resolveEmojiData: resolve });

    await expect.element(page.getByText('😀')).toBeInTheDocument();
    expect(resolve).toHaveBeenCalledWith('ne', {
      emojiVersion: 5,
      emojibaseUrl: undefined,
      signal: expect.any(AbortSignal),
    });
  });

  it('should abort a pending load when the picker unmounts', async () => {
    let signal: AbortSignal | undefined;
    const { unmount } = await render(DefaultPage, {
      locale: 'ne',
      resolveEmojiData: (_, options) => {
        signal = options.signal;

        return new Promise<EmojiData>(() => {});
      },
    });

    await expect.poll(() => signal).toBeDefined();
    expect(signal?.aborted).toBe(false);

    await unmount();

    expect(signal?.aborted).toBe(true);
  });

  it('should abort the previous load and show the new locale when the locale changes', async () => {
    const signals = new Map<string, AbortSignal>();
    const { rerender } = await render(DefaultPage, {
      locale: 'slow',
      resolveEmojiData: (locale, options) => {
        signals.set(locale, options.signal!);

        return locale === 'slow' ? new Promise<EmojiData>(() => {}) : DATA;
      },
    });

    await expect.poll(() => signals.has('slow')).toBe(true);

    await rerender({ locale: 'ne' });

    await expect.element(page.getByText('😀')).toBeInTheDocument();
    expect(signals.get('slow')?.aborted).toBe(true);
    expect(signals.get('ne')?.aborted).toBe(false);
  });
});

describe('EmojiPicker.Root CSS variables', () => {
  it('should expose the measured sizes and the emoji font', async () => {
    await render(DefaultPage, { viewportHeight: 300 });

    await expect.element(page.getByText('😀')).toBeInTheDocument();

    const root = page.getByTestId('root').element() as HTMLElement;

    expect(root.style.getPropertyValue('--frimousse-viewport-height')).toBe('300px');
    expect(root.style.getPropertyValue('--frimousse-viewport-width')).toMatch(/^\d+(\.\d+)?px$/);
    expect(root.style.getPropertyValue('--frimousse-row-height')).toBe('28px');
    expect(root.style.getPropertyValue('--frimousse-category-header-height')).toMatch(
      /^\d+(\.\d+)?px$/,
    );
    expect(root.style.getPropertyValue('--frimousse-emoji-font')).toContain('Apple Color Emoji');
  });
});
