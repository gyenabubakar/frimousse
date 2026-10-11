<!-- A picker whose search input can be removed, for the Search unmount test. -->
<script lang="ts">
  import * as EmojiPicker from '../emoji-picker.js';

  let { showSearch = true }: { showSearch?: boolean } = $props();
</script>

<EmojiPicker.Root emojiVersion={12}>
  {#if showSearch}
    <EmojiPicker.Search data-testid="search" value="cat" />
  {/if}
  <EmojiPicker.Empty>
    {#snippet children({ search })}<span data-testid="empty">No emoji for {search}</span>{/snippet}
  </EmojiPicker.Empty>
  <EmojiPicker.Viewport style="height: 300px;">
    <EmojiPicker.List data-testid="list" />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
