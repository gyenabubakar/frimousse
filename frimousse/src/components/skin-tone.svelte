<script lang="ts">
  import { useSkinTone } from '../hooks.svelte.js';
  import type { EmojiPickerSkinToneProps, SkinTone } from '../types.js';

  let { emoji, children }: EmojiPickerSkinToneProps = $props();

  const skinTone = useSkinTone(() => emoji);

  function setSkinTone(value: SkinTone) {
    skinTone.current = value;
  }
</script>

{@render children({
  skinTone: skinTone.current,
  setSkinTone,
  skinToneVariations: skinTone.variations,
})}
