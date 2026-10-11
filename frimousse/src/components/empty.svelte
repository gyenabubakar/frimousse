<script lang="ts">
  import { getEmojiPickerStore } from '../store.svelte.js';
  import type { EmojiPickerEmptyProps } from '../types.js';

  let { children, ...props }: EmojiPickerEmptyProps = $props();

  const store = getEmojiPickerStore();
</script>

{#if store.isEmpty}
  <span frimousse-empty="" {...props}>{@render children?.({ search: store.search })}</span>
{/if}
