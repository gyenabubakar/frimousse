<script lang="ts">
  import { EmojiPicker as EmojiPickerPrimitive } from '@gyen/frimousse';
  import SpinnerGapIcon from 'phosphor-svelte/lib/SpinnerGap';
  import type { EmojiPickerViewportProps } from '@gyen/frimousse';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: Omit<EmojiPickerViewportProps, 'children'> = $props();
</script>

<EmojiPickerPrimitive.Viewport
  bind:ref
  data-slot="emoji-picker-viewport"
  class={cn('relative flex-1 outline-hidden', className)}
  {...restProps}
>
  <EmojiPickerPrimitive.Loading
    data-slot="emoji-picker-loading"
    class="absolute inset-0 flex items-center justify-center text-muted-foreground"
  >
    <SpinnerGapIcon class="size-4 animate-spin" aria-hidden="true" />
    <span class="sr-only">Loading…</span>
  </EmojiPickerPrimitive.Loading>
  <EmojiPickerPrimitive.Empty
    data-slot="emoji-picker-empty"
    class="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground"
  >
    No emoji found.
  </EmojiPickerPrimitive.Empty>
  <EmojiPickerPrimitive.List data-slot="emoji-picker-list" class="pb-1 select-none">
    {#snippet row({ props, children })}
      <div {...props} data-slot="emoji-picker-row" class="scroll-my-1 px-1">
        {@render children()}
      </div>
    {/snippet}
    {#snippet emoji({ emoji, props })}
      <button
        {...props}
        data-slot="emoji-picker-emoji"
        class="flex size-7 items-center justify-center rounded-sm text-base data-active:bg-accent"
      >
        {emoji.emoji}
      </button>
    {/snippet}
    {#snippet categoryHeader({ category, props })}
      <div
        {...props}
        data-slot="emoji-picker-category-header"
        class="bg-popover px-3 pt-3.5 pb-2 text-xs leading-none text-muted-foreground"
      >
        {category.label}
      </div>
    {/snippet}
  </EmojiPickerPrimitive.List>
</EmojiPickerPrimitive.Viewport>
