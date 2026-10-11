<script lang="ts">
  import { getEmojiPickerStore } from '../store.svelte.js';
  import type { EmojiPickerLoadingProps } from '../types.js';

  let { children, ...props }: EmojiPickerLoadingProps = $props();

  const store = getEmojiPickerStore();
</script>

{#if store.isLoading}
  <span frimousse-loading="" {...props}>{@render children?.()}</span>
{/if}
