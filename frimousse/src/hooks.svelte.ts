import { getEmojiPickerStore } from './store.svelte.js';
import { getSkinToneVariations } from './utils/get-skin-tone-variations.js';
import type { Emoji, SkinTone, SkinToneVariation } from './types.js';

/**
 * Returns the currently active emoji (either hovered or selected via keyboard
 * navigation) as a reactive `current` value. Call it while a component inside
 * `EmojiPicker.Root` initializes.
 *
 * @example
 * ```svelte
 * <script>
 *   const activeEmoji = useActiveEmoji();
 * </script>
 *
 * {#if activeEmoji.current}
 *   <span>{activeEmoji.current.emoji} {activeEmoji.current.label}</span>
 * {:else}
 *   <span>Select an emoji…</span>
 * {/if}
 * ```
 */
export function useActiveEmoji(): { readonly current: Emoji | undefined } {
  const store = getEmojiPickerStore();

  return {
    get current() {
      return store.activeEmoji;
    },
  };
}

/**
 * Returns the current skin tone (which can also be set) and the skin tone
 * variations of an emoji (by default, ✋). Call it while a component inside
 * `EmojiPicker.Root` initializes.
 *
 * @example
 * ```svelte
 * <script>
 *   const skinTone = useSkinTone("👋");
 * </script>
 *
 * {#each skinTone.variations as variation (variation.skinTone)}
 *   <button onclick={() => (skinTone.current = variation.skinTone)}>
 *     {variation.emoji}
 *   </button>
 * {/each}
 * ```
 */
export function useSkinTone(emoji: string | (() => string | undefined) = '✋'): {
  current: SkinTone;
  readonly variations: SkinToneVariation[];
} {
  const store = getEmojiPickerStore();
  const variations = $derived(
    getSkinToneVariations((typeof emoji === 'function' ? emoji() : emoji) ?? '✋'),
  );

  return {
    get current() {
      return store.skinTone;
    },
    set current(skinTone) {
      store.skinTone = skinTone;
    },
    get variations() {
      return variations;
    },
  };
}
