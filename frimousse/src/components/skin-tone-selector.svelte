<script lang="ts">
  import { useSkinTone } from '../hooks.svelte.js';
  import { getEmojiPickerStore } from '../store.svelte.js';
  import type { EmojiPickerSkinToneSelectorProps } from '../types.js';

  let {
    emoji,
    ref = $bindable(null),
    onclick,
    'aria-label': ariaLabel = 'Change skin tone',
    ...props
  }: EmojiPickerSkinToneSelectorProps = $props();

  const store = getEmojiPickerStore();
  const skinTone = useSkinTone(() => emoji);
  const index = $derived(
    Math.max(
      0,
      skinTone.variations.findIndex((variation) => variation.skinTone === skinTone.current),
    ),
  );
  const variation = $derived(skinTone.variations[index]!);
  const nextSkinTone = $derived(
    skinTone.variations[(index + 1) % skinTone.variations.length]!.skinTone,
  );
  const nextSkinToneLabel = $derived(
    nextSkinTone === 'none' ? undefined : store.data?.skinTones[nextSkinTone],
  );

  function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
    onclick?.(event);

    if (!event.defaultPrevented) skinTone.current = nextSkinTone;
  }
</script>

<button
  type="button"
  {...props}
  bind:this={ref}
  aria-label={ariaLabel + (nextSkinToneLabel ? ` (${nextSkinToneLabel})` : '')}
  aria-live="polite"
  frimousse-skin-tone-selector=""
  onclick={handleClick}
>
  {variation.emoji}
</button>
