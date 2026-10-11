<script lang="ts">
  import * as EmojiPicker from '$lib/registry/emoji-picker';

  let selected = $state<string[]>([]);
</script>

<div class="flex flex-col items-center gap-4">
  <EmojiPicker.Root
    class="h-85.5 rounded-lg border shadow-md"
    onEmojiSelect={({ emoji }) => (selected = [...selected, emoji].slice(-12))}
  >
    <EmojiPicker.Search />
    <EmojiPicker.Content />
    <EmojiPicker.Footer />
  </EmojiPicker.Root>
  <p class="flex h-7 items-center gap-1 text-xl" aria-live="polite" data-testid="hero-selected">
    {#if selected.length === 0}
      <span class="text-sm text-muted-foreground">Pick an emoji…</span>
    {:else}
      {selected.join('')}
    {/if}
  </p>
</div>
