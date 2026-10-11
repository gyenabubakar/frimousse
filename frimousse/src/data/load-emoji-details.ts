import { getCachedEmojiData, getEmojibaseUrl, suspendForEmojiData } from './emoji-data-store.js';
import { defaultEmojiDataResolver, loadEmojiData, validateLocale } from './emoji.js';
import { findEmojiDetails } from './get-emoji-details.js';
import type { EmojiDetails } from '../types.js';
import type { GetEmojiDetailsOptions } from './get-emoji-details.js';

export type LoadEmojiDetailsOptions = GetEmojiDetailsOptions;

/**
 * Resolves an emoji's localized details, loading the shared dataset first if
 * needed. Works without a picker, and shares cached data and pending requests
 * with pickers using the same locale and source. Unknown emojis resolve to
 * undefined; loading errors reject (and stay cached for that source).
 */
export async function loadEmojiDetails(
  emoji: string,
  { locale = 'en', emojiVersion, emojibaseUrl, resolveEmojiData }: LoadEmojiDetailsOptions = {},
): Promise<EmojiDetails | undefined> {
  const resolver = resolveEmojiData === defaultEmojiDataResolver ? undefined : resolveEmojiData;
  const dataLocale = resolver ? locale : validateLocale(locale);
  const options = { emojiVersion, emojibaseUrl, resolveEmojiData: resolver };

  for (;;) {
    const emojis = getCachedEmojiData(dataLocale, options)?.emojis;

    if (emojis) return findEmojiDetails(emoji, emojis);

    // Throws the shared pending promise, or the cached loading error.
    try {
      suspendForEmojiData(dataLocale, options, () =>
        resolver
          ? resolver(dataLocale, { emojiVersion, emojibaseUrl })
          : loadEmojiData(getEmojibaseUrl(options), validateLocale(dataLocale)),
      );
    } catch (thrown) {
      if (!(thrown instanceof Promise)) throw thrown;

      await thrown;
    }
  }
}
