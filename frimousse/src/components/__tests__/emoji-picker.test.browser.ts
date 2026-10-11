import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import { defaultEmojiDataResolver } from '../../data/emoji.js';
import DefaultPage from './default-page.svelte';
import type { EmojiData, EmojiDataResolver, SkinTone } from '../../types.js';

describe('EmojiPicker', () => {
  it('should render parts', async () => {
    await render(DefaultPage);

    await expect.element(page.getByTestId('root')).toBeInTheDocument();
    await expect.element(page.getByTestId('search')).toBeInTheDocument();
    await expect.element(page.getByTestId('viewport')).toBeInTheDocument();
    await expect.element(page.getByTestId('list')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', async () => {
    await render(DefaultPage);

    await expect.element(page.getByTestId('list')).toHaveAttribute('role', 'grid');
    await expect.element(page.getByTestId('list')).toHaveAttribute('aria-rowcount');
    await expect.element(page.getByTestId('list')).toHaveAttribute('aria-colcount');

    const rows = page.getByRole('row');

    // ARIA positions count from 1.
    await expect.element(rows.first()).toHaveAttribute('aria-rowindex', '1');
    await expect.element(rows.nth(5)).toHaveAttribute('aria-rowindex', '6');

    const emojis = page.getByRole('gridcell');

    await expect.element(emojis.first()).toHaveAttribute('role', 'gridcell');
    await expect.element(emojis.first()).toHaveAttribute('aria-colindex', '1');

    await emojis.nth(2).hover();
    await emojis.first().hover();

    await expect.element(emojis.first()).toHaveAttribute('aria-selected');
    await expect.element(page.getByTestId('search')).toHaveAttribute('type', 'search');
  });

  it('should have the expected data attributes', async () => {
    await render(DefaultPage, { emojiVariant: 'active-only' });

    await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-focused');

    await page.getByTestId('search').click();

    await expect.element(page.getByTestId('root')).toHaveAttribute('data-focused');
    await expect.element(page.getByTestId('emoji: 😀')).not.toHaveAttribute('data-active');

    await page.getByTestId('emoji: 😀').hover();

    await expect.element(page.getByTestId('emoji: 😀')).toHaveAttribute('data-active');
  });

  it('should support selecting an emoji on click', async () => {
    await render(DefaultPage);

    await page.getByText('😀').click();

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('😀');
  });

  it('should support navigating and selecting an emoji with the keyboard', async () => {
    await render(DefaultPage, { columns: 4 });

    await page.getByTestId('search').click();

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('😀');

    await userEvent.keyboard('{ArrowRight>4/}');
    await userEvent.keyboard('{ArrowLeft>2/}');
    await userEvent.keyboard('{ArrowBottom}');
    await userEvent.keyboard('{ArrowLeft}');
    await userEvent.keyboard('{ArrowTop}');
    await userEvent.keyboard('{ArrowLeft}');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('😀');
  });

  it('should scroll the viewport when navigating with the keyboard', async () => {
    await render(DefaultPage, { emojiVariant: 'highlight', viewportHeight: 125 });

    await page.getByTestId('search').click();

    await userEvent.keyboard('{ArrowDown>5/}');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('🤥');

    await userEvent.keyboard('{ArrowUp>5/}');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('😀');

    await userEvent.keyboard('{ArrowRight>16/}');
    await userEvent.keyboard('{ArrowDown>60/}');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('🍇');

    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowUp>80/}');
    await userEvent.keyboard('{ArrowLeft>10/}');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('😀');

    // Losing focus resets the active emoji, so keyboard navigation starts from the first emoji again
    await userEvent.tab({ shift: true });
    await page.getByTestId('search').click();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('😀');
  });

  it('should reset the active emoji when losing focus', async () => {
    await render(DefaultPage, { extraPart: 'active-emoji' });

    await page.getByTestId('search').click();
    await userEvent.keyboard('{ArrowDown}');

    await expect.element(page.getByTestId('active-emoji')).toHaveTextContent('Grinning face');

    await userEvent.tab({ shift: true });

    await expect.element(page.getByTestId('active-emoji')).not.toBeInTheDocument();
  });

  it('should fallback to default values for unsupported locales and skin tones', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(DefaultPage, {
      locale: 'unsupported',
      skinTone: 'unsupported' as SkinTone,
    });

    await expect.element(page.getByText('Smileys & emotion')).toBeInTheDocument();

    await page.getByTestId('search').fill('holding');

    await expect.element(page.getByText('🧑‍🤝‍🧑')).toBeInTheDocument();
  });
});

describe('EmojiPicker.Root', () => {
  it('should support an initial locale and changing it', async () => {
    const { rerender } = await render(DefaultPage, { locale: 'fr' });

    await expect.element(page.getByText('Smileys et émotion')).toBeInTheDocument();

    await rerender({ locale: 'en' });

    await expect.element(page.getByText('Smileys & emotion')).toBeInTheDocument();
  });

  it('should support an initial skin tone and changing it', async () => {
    const { rerender } = await render(DefaultPage, {
      search: 'holding',
      skinTone: 'dark',
      viewportHeight: 2000,
    });

    await expect.element(page.getByText('🧑🏿‍🤝‍🧑🏿')).toBeInTheDocument();

    await rerender({ skinTone: 'none' });

    await expect.element(page.getByText('🧑‍🤝‍🧑')).toBeInTheDocument();
  });

  it('should support an initial columns count and changing it', async () => {
    const { rerender } = await render(DefaultPage, { columns: 5 });

    await expect.element(page.getByRole('gridcell').nth(4)).toHaveAttribute('aria-colindex', '5');
    await expect.element(page.getByRole('gridcell').nth(5)).toHaveAttribute('aria-colindex', '1');
    await expect.element(page.getByRole('gridcell').nth(9)).toHaveAttribute('aria-colindex', '5');

    await rerender({ columns: 8 });

    await expect.element(page.getByRole('gridcell').nth(7)).toHaveAttribute('aria-colindex', '8');
  });

  it('should support disabling sticky category headers', async () => {
    await render(DefaultPage, { categoryHeaderVariant: 'testid', sticky: false });

    await expect
      .element(page.getByTestId('category-header').nth(1))
      .not.toHaveStyle({ position: 'sticky' });
  });
});

describe('EmojiPicker.Search', () => {
  it('should support searching', async () => {
    await render(DefaultPage);

    await page.getByTestId('search').fill('cat');

    await expect.element(page.getByText('🐈️')).toBeInTheDocument();
  });

  it('should support an initial search value', async () => {
    await render(DefaultPage, { search: 'hello' });

    await expect.element(page.getByTestId('search')).toHaveValue('hello');
  });

  it('should support a bound search value', async () => {
    await render(DefaultPage);

    await expect.element(page.getByTestId('search')).toHaveValue('');

    await page.getByTestId('search').fill('cat');
    await expect.element(page.getByTestId('controlled-search')).toHaveValue('cat');
    await expect.element(page.getByText('🐈️')).toBeInTheDocument();

    await page.getByTestId('search').fill('123456789');
    await expect.element(page.getByTestId('controlled-search')).toHaveValue('123456789');
    await expect.element(page.getByTestId('empty')).toBeInTheDocument();
  });

  it('should support an external bound search value', async () => {
    await render(DefaultPage);

    await page.getByTestId('controlled-search').fill('cat');
    await expect.element(page.getByTestId('search')).toHaveValue('cat');
    await expect.element(page.getByText('🐈️')).toBeInTheDocument();

    await page.getByTestId('controlled-search').fill('123456789');
    await expect.element(page.getByTestId('search')).toHaveValue('123456789');
    await expect.element(page.getByTestId('empty')).toBeInTheDocument();
  });
});

describe('EmojiPicker.Viewport', () => {
  it.each([
    ['with sticky headers', true],
    ['without sticky headers', false],
  ])('should virtualize rows based on the viewport height %s', async (_, sticky) => {
    const { rerender } = await render(DefaultPage, {
      rowVariant: 'custom-row',
      categoryHeaderVariant: 'sized',
      sticky,
    });

    await expect.element(page.getByText('😀')).toBeInTheDocument();
    await expect.element(page.getByRole('row').nth(10)).toBeInTheDocument();
    await expect.element(page.getByRole('row').nth(20)).not.toBeInTheDocument();

    await rerender({ viewportHeight: 500, rowHeight: 20, categoryHeaderHeight: 20 });

    await expect.element(page.getByRole('row').nth(10)).toBeInTheDocument();
    await expect.element(page.getByRole('row').nth(20)).toBeInTheDocument();

    await rerender({ viewportHeight: 200, rowHeight: 100, categoryHeaderHeight: 400 });

    await expect.element(page.getByRole('row').nth(10)).not.toBeInTheDocument();
    await expect.element(page.getByRole('row').nth(20)).not.toBeInTheDocument();
  });

  it.each([
    ['with sticky headers', true],
    ['without sticky headers', false],
  ])('should virtualize rows based on scroll %s', async (_, sticky) => {
    await render(DefaultPage, { sticky, viewportHeight: 200 });

    function scrollViewport() {
      document
        .querySelector("[data-testid='viewport']")
        ?.scrollBy({ top: 500, behavior: 'smooth' });
    }

    await expect.element(page.getByRole('row').nth(5)).toHaveAttribute('aria-rowindex', '6');
    await expect.element(page.getByRole('row').nth(20)).not.toBeInTheDocument();

    scrollViewport();

    await expect.element(page.getByRole('row').nth(5)).toHaveAttribute('aria-rowindex', '21');

    scrollViewport();

    await expect.element(page.getByRole('row').nth(5)).toHaveAttribute('aria-rowindex', '39');
  });
});

describe('EmojiPicker.List', () => {
  it('should support passing custom snippets', async () => {
    await render(DefaultPage, {
      emojiVariant: 'label',
      rowVariant: 'labelled',
      categoryHeaderVariant: 'custom',
    });

    await expect
      .element(page.getByTestId('custom-emoji: 😊'))
      .toHaveTextContent('Smiling face with smiling eyes');
    await expect.element(page.getByRole('row').nth(10)).toHaveAccessibleName('Custom row');
    await expect
      .element(page.getByTestId('custom-category-header: Activities'))
      .toHaveTextContent('Custom (Activities)');
  });
});

describe('EmojiPicker.SkinToneSelector', () => {
  it('should display the current skin tone and change to the next one on click', async () => {
    await render(DefaultPage, {
      extraPart: 'skin-tone-selector',
      skinToneSelectorEmoji: '👸',
      skinTone: 'medium',
    });

    const selector = page.getByTestId('skin-tone-selector');

    for (const emoji of ['👸🏽', '👸🏾', '👸🏿', '👸', '👸🏻', '👸🏼']) {
      await expect.element(selector).toHaveTextContent(emoji);
      await selector.click();
    }
  });

  it('should be correctly labelled', async () => {
    await render(DefaultPage, { extraPart: 'skin-tone-selector', skinTone: 'medium' });

    const selector = page.getByTestId('skin-tone-selector');

    for (const label of [
      'Change skin tone (Medium-dark skin tone)',
      'Change skin tone (Dark skin tone)',
      'Change skin tone',
      'Change skin tone (Light skin tone)',
      'Change skin tone (Medium-light skin tone)',
      'Change skin tone (Medium skin tone)',
    ]) {
      await expect.element(selector).toHaveAccessibleName(label);
      await selector.click();
    }
  });
});

describe('EmojiPicker.Loading', () => {
  it('should render when loading emojis', async () => {
    await render(DefaultPage);

    await expect.element(page.getByTestId('loading')).toBeInTheDocument();
  });
});

describe('EmojiPicker.Empty', () => {
  it('should render when no emojis are found', async () => {
    await render(DefaultPage);

    await page.getByTestId('search').fill('..........');

    await expect.element(page.getByTestId('empty')).toHaveTextContent('No emojis found');
  });

  it('should support displaying the search value', async () => {
    await render(DefaultPage, { emptyVariant: 'search' });

    await page.getByTestId('search').fill('..........');

    await expect
      .element(page.getByTestId('empty'))
      .toHaveTextContent('No emojis found for ..........');
  });
});

describe('EmojiPicker.ActiveEmoji', () => {
  it('should expose the active emoji', async () => {
    await render(DefaultPage, { extraPart: 'active-emoji' });

    await expect.element(page.getByTestId('active-emoji')).not.toBeInTheDocument();

    await page.getByText('😀').hover();

    await expect.element(page.getByTestId('active-emoji')).toHaveTextContent('Grinning face');

    await page.getByText('😊').hover();

    await expect
      .element(page.getByTestId('active-emoji'))
      .toHaveTextContent('Smiling face with smiling eyes');
  });
});

describe('EmojiPicker.SkinTone', () => {
  it('should expose the current skin tone and allow changing it', async () => {
    await render(DefaultPage, { extraPart: 'skin-tone' });

    await expect.element(page.getByTestId('skin-tone')).toHaveTextContent('none');

    await page.getByTestId('set-skin-tone-dark').click();

    await expect.element(page.getByTestId('skin-tone')).toHaveTextContent('dark');
  });
});

describe('EmojiPicker with a custom emoji data resolver', () => {
  const CUSTOM_EMOJI_DATA: EmojiData = {
    locale: 'ne',
    categories: [{ index: 0, label: 'अनुहारहरू' }],
    skinTones: {
      light: '🏻',
      'medium-light': '🏼',
      medium: '🏽',
      'medium-dark': '🏾',
      dark: '🏿',
    },
    emojis: [
      {
        emoji: '😀',
        category: 0,
        label: 'हाँसेको अनुहार',
        version: 1,
        tags: ['हाँसो', 'खुसी'],
      },
      {
        emoji: '😍',
        category: 0,
        label: 'मुटु आकारका आँखा भएको अनुहार',
        version: 1,
        tags: ['माया', 'मुटु'],
      },
      {
        emoji: '🇳🇵',
        category: 0,
        label: 'नेपालको झण्डा',
        version: 1,
        tags: ['झण्डा'],
        countryFlag: true,
      },
    ],
  };

  const resolveCustomEmojiData = () => CUSTOM_EMOJI_DATA;

  it.each(['ne', 'ne-custom'])(
    'should render custom data for locale %s without fetching',
    async (locale) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      await render(DefaultPage, { locale, resolveEmojiData: resolveCustomEmojiData });

      await expect.element(page.getByText('😀')).toBeInTheDocument();
      await expect.element(page.getByText('😍')).toBeInTheDocument();
      await expect.element(page.getByText('🇳🇵')).toBeInTheDocument();

      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

  it('should search custom data using custom labels and tags', async () => {
    await render(DefaultPage, { locale: 'ne', resolveEmojiData: resolveCustomEmojiData });

    await expect.element(page.getByText('😀')).toBeInTheDocument();

    await page.getByTestId('search').fill('माया');

    await expect.element(page.getByText('😍')).toBeInTheDocument();
    await expect.element(page.getByText('😀')).not.toBeInTheDocument();
  });

  it('should support selecting a custom emoji', async () => {
    await render(DefaultPage, { locale: 'ne', resolveEmojiData: resolveCustomEmojiData });

    await page.getByText('🇳🇵').click();

    await expect.element(page.getByTestId('selected-emoji')).toHaveTextContent('🇳🇵');
  });

  it('should delegate unhandled locales to the default resolver', async () => {
    await render(DefaultPage, {
      locale: 'en',
      resolveEmojiData: (locale, options) =>
        locale === 'ne' ? CUSTOM_EMOJI_DATA : defaultEmojiDataResolver(locale, options),
    });

    await expect
      .element(page.getByRole('gridcell', { name: 'Grinning face', exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole('gridcell', { name: 'हाँसेको अनुहार' }))
      .not.toBeInTheDocument();
  });

  it("should not re-resolve when the resolver's identity changes", async () => {
    const resolve = vi.fn<EmojiDataResolver>(() => CUSTOM_EMOJI_DATA);
    const { rerender } = await render(DefaultPage, {
      locale: 'ne',
      resolveEmojiData: (...args) => resolve(...args),
    });

    await expect.element(page.getByText('😀')).toBeInTheDocument();
    expect(resolve).toHaveBeenCalledTimes(1);

    await rerender({ resolveEmojiData: (...args) => resolve(...args) });
    await expect.element(page.getByText('😀')).toBeInTheDocument();

    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it.each(['synchronous', 'asynchronous'])('should handle %s resolver errors', async (kind) => {
    const error = new Error('Failed to load emoji data');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await render(DefaultPage, {
      resolveEmojiData: () => {
        if (kind === 'asynchronous') return Promise.reject(error);

        throw error;
      },
    });

    await expect.poll(() => errorSpy.mock.calls).toEqual([[error]]);
  });
});
