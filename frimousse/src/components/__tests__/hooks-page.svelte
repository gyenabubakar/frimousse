<script lang="ts">
  import * as EmojiPicker from '../emoji-picker.js';
  import HooksProbe from './hooks-probe.svelte';
  import type { SkinTone } from '../../types.js';

  let {
    emoji,
    skinTone = $bindable('none'),
    withRoot = true,
  }: { emoji?: string; skinTone?: SkinTone; withRoot?: boolean } = $props();
</script>

<p data-testid="bound-skin-tone">{skinTone}</p>
{#if withRoot}
  <EmojiPicker.Root emojiVersion={12} bind:skinTone>
    <EmojiPicker.Search data-testid="search" />
    <EmojiPicker.Viewport data-testid="viewport" style="height: 300px;">
      <EmojiPicker.List />
    </EmojiPicker.Viewport>
    <EmojiPicker.SkinToneSelector data-testid="skin-tone-selector" />
    <HooksProbe {emoji} />
  </EmojiPicker.Root>
{:else}
  <HooksProbe {emoji} />
{/if}
