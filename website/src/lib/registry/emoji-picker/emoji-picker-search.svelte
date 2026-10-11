<script lang="ts">
  import { EmojiPicker as EmojiPickerPrimitive } from '@gyen/frimousse';
  import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlass';
  import type { EmojiPickerSearchProps } from '@gyen/frimousse';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    value = $bindable(''),
    class: className,
    ...restProps
  }: EmojiPickerSearchProps = $props();
</script>

<div
  data-slot="emoji-picker-search-wrapper"
  class={cn('flex h-9 items-center gap-2 border-b px-3', className)}
>
  <MagnifyingGlassIcon class="size-4 shrink-0 opacity-50" />
  <EmojiPickerPrimitive.Search
    bind:ref
    bind:value
    data-slot="emoji-picker-search"
    class="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
    {...restProps}
  />
</div>
