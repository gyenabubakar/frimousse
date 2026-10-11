<script lang="ts">
  import { EmojiPicker as EmojiPickerPrimitive } from '@gyen/frimousse';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils.js';
  import type { WithElementRef } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'children'>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="emoji-picker-footer"
  class={cn(
    'flex w-full max-w-(--frimousse-viewport-width) min-w-0 items-center gap-1 border-t p-2',
    className,
  )}
  {...restProps}
>
  <EmojiPickerPrimitive.ActiveEmoji>
    {#snippet children({ emoji })}
      {#if emoji}
        <div class="flex size-7 flex-none items-center justify-center text-lg">
          {emoji.emoji}
        </div>
        <span class="truncate text-xs text-secondary-foreground">{emoji.label}</span>
      {:else}
        <span class="ml-1.5 flex h-7 items-center truncate text-xs text-muted-foreground">
          Select an emoji…
        </span>
      {/if}
    {/snippet}
  </EmojiPickerPrimitive.ActiveEmoji>
</div>
