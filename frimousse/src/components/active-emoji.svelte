<script lang="ts">
  import { getEmojiPickerStore } from '../store.svelte.js';
  import type { EmojiPickerActiveEmojiProps } from '../types.js';

  let { children }: EmojiPickerActiveEmojiProps = $props();

  const store = getEmojiPickerStore();
</script>

{@render children({ emoji: store.activeEmoji })}
