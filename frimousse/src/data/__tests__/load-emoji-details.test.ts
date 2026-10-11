import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmojiData, EmojiDataResolver } from '../../types.js';

let loadEmojiDetails: typeof import('../load-emoji-details.js').loadEmojiDetails;
let getEmojiDetails: typeof import('../get-emoji-details.js').getEmojiDetails;
let defaultEmojiDataResolver: typeof import('../emoji.js').defaultEmojiDataResolver;
let resolveCustomEmojiData: typeof import('../emoji-data-store.js').resolveCustomEmojiData;

const customData: EmojiData = {
  locale: 'ne',
  emojis: [
    {
      emoji: '😀',
      label: 'हाँसेको अनुहार',
      tags: ['खुसी'],
      category: 0,
      version: 1,
    },
  ],
  categories: [{ index: 0, label: 'अनुहारहरू' }],
  skinTones: {
    light: '🏻',
    'medium-light': '🏼',
    medium: '🏽',
    'medium-dark': '🏾',
    dark: '🏿',
  },
};

function pendingData() {
  let resolve: (data: EmojiData) => void = () => {};
  const promise = new Promise<EmojiData>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

beforeEach(async () => {
  vi.resetModules();
  ({ loadEmojiDetails } = await import('../load-emoji-details.js'));
  ({ getEmojiDetails } = await import('../get-emoji-details.js'));
  ({ defaultEmojiDataResolver } = await import('../emoji.js'));
  ({ resolveCustomEmojiData } = await import('../emoji-data-store.js'));
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('loadEmojiDetails', () => {
  it('should load without a picker, then populate the synchronous lookup', async () => {
    expect(getEmojiDetails('👍🏽')).toBeUndefined();
    expect(await loadEmojiDetails('👍🏽')).toMatchObject({ label: 'Thumbs up' });
    expect(getEmojiDetails('👍🏽')).toBe(getEmojiDetails('👍'));
  });

  it('should share a cold load across callers and the default resolver', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const [heart, thumbs] = await Promise.all([
      loadEmojiDetails('❤️'),
      loadEmojiDetails('👍'),
      defaultEmojiDataResolver('en', {}),
    ]);

    expect(heart?.label).toBe('Red heart');
    expect(thumbs?.label).toBe('Thumbs up');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should return warm data without fetching or reading storage', async () => {
    await defaultEmojiDataResolver('en', { emojiVersion: 5 });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const storageSpy = vi.spyOn(Storage.prototype, 'getItem');

    expect(await loadEmojiDetails('❤️', { emojiVersion: 5 })).toBe(
      getEmojiDetails('❤️', { emojiVersion: 5 }),
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageSpy).not.toHaveBeenCalled();
  });

  it('should resolve to undefined for unknown emojis', async () => {
    expect(await loadEmojiDetails('not an emoji')).toBeUndefined();
  });

  it('should keep locales and sources separate', async () => {
    const english = await loadEmojiDetails('❤️', {
      emojibaseUrl: 'https://example.com/first',
    });
    const french = await loadEmojiDetails('❤️', {
      locale: 'fr',
      emojibaseUrl: 'https://example.com/second',
    });

    expect(english?.label).toBe('Red heart');
    expect(french?.label).toBe('Cœur rouge');
  });

  it('should cache loading failures without retrying', async () => {
    const error = new Error('Offline');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(error);

    await expect(loadEmojiDetails('❤️')).rejects.toBe(error);
    await expect(loadEmojiDetails('❤️')).rejects.toBe(error);
    expect(getEmojiDetails('❤️')).toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should recover after a picker loads the data', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Offline'));

    await expect(loadEmojiDetails('❤️')).rejects.toThrow('Offline');
    await defaultEmojiDataResolver('en', {});
    expect(await loadEmojiDetails('❤️')).toMatchObject({ label: 'Red heart' });
  });

  it('should include emojis hidden by picker filtering', async () => {
    expect(await loadEmojiDetails('🇳🇵')).toMatchObject({ label: 'Flag: Nepal' });
    expect(await loadEmojiDetails('🇳🇵', { resolveEmojiData: defaultEmojiDataResolver })).toBe(
      getEmojiDetails('🇳🇵'),
    );
  });

  it('should share one custom request across callers', async () => {
    const pending = pendingData();
    const resolveEmojiData = vi.fn(() => pending.promise);
    const options = { locale: 'ne', resolveEmojiData };
    const first = loadEmojiDetails('😀', options);
    const second = loadEmojiDetails('😀', options);

    pending.resolve(customData);

    expect(await first).toBe(customData.emojis[0]);
    expect(await second).toBe(customData.emojis[0]);
    expect(resolveEmojiData).toHaveBeenCalledTimes(1);
    expect(resolveEmojiData).toHaveBeenCalledWith('ne', {
      emojiVersion: undefined,
      emojibaseUrl: undefined,
    });
  });

  it('should reuse custom picker data without calling the resolver', async () => {
    const resolveEmojiData = vi.fn(() => customData);
    const options = { locale: 'ne', resolveEmojiData };

    await resolveCustomEmojiData(resolveEmojiData, 'ne', {});
    expect(await loadEmojiDetails('😀', options)).toBe(customData.emojis[0]);
    expect(resolveEmojiData).toHaveBeenCalledTimes(1);
  });

  it('should keep custom resolvers and versions separate', async () => {
    const firstResolver = vi.fn<EmojiDataResolver>(() => customData);
    const secondResolver = vi.fn<EmojiDataResolver>(() => ({
      ...customData,
      emojis: [],
    }));

    expect(
      await loadEmojiDetails('😀', {
        locale: 'ne',
        emojiVersion: 5,
        resolveEmojiData: firstResolver,
      }),
    ).toBe(customData.emojis[0]);
    expect(
      await loadEmojiDetails('😀', { locale: 'ne', resolveEmojiData: secondResolver }),
    ).toBeUndefined();
    expect(
      getEmojiDetails('😀', { locale: 'ne', resolveEmojiData: firstResolver }),
    ).toBeUndefined();
  });

  it.each(['throw', 'reject'])(
    'should reject when a custom resolver fails (%s)',
    async (failure) => {
      const error = new Error('Custom failure');
      const resolveEmojiData = vi.fn(() => {
        if (failure === 'throw') throw error;

        return Promise.reject(error);
      });

      await expect(loadEmojiDetails('😀', { locale: 'ne', resolveEmojiData })).rejects.toBe(error);
    },
  );
});
