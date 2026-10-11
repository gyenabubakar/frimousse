<script lang="ts">
  import { EmojiPicker } from '@gyen/frimousse';
  import * as StyledPicker from '$lib/registry/emoji-picker';
</script>

<StyledPicker.Root class="h-85.5 rounded-lg border shadow-md">
  <StyledPicker.Search />
  <EmojiPicker.SkinTone emoji="👋">
    {#snippet children({ skinTone, setSkinTone, skinToneVariations })}
      <div class="flex items-center justify-between border-b px-2 py-1.5">
        {#each skinToneVariations as variation (variation.skinTone)}
          <button
            type="button"
            class="grid size-8 place-items-center rounded-md text-lg hover:bg-accent data-on:bg-accent data-on:ring-1 data-on:ring-ember"
            data-on={variation.skinTone === skinTone ? '' : undefined}
            aria-label="Use the {variation.skinTone} skin tone"
            aria-pressed={variation.skinTone === skinTone}
            onclick={() => setSkinTone(variation.skinTone)}
          >
            {variation.emoji}
          </button>
        {/each}
      </div>
    {/snippet}
  </EmojiPicker.SkinTone>
  <StyledPicker.Content />
</StyledPicker.Root>
