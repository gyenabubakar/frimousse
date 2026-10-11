<script lang="ts">
  import { EmojiPicker as EmojiPickerPrimitive } from '@gyen/frimousse';
  import type { EmojiPickerRootProps } from '@gyen/frimousse';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    skinTone = $bindable(),
    class: className,
    ...restProps
  }: EmojiPickerRootProps = $props();
</script>

<EmojiPickerPrimitive.Root
  bind:ref
  bind:skinTone
  data-slot="emoji-picker"
  class={cn(
    'isolate flex h-full w-fit flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
    className,
  )}
  {...restProps}
/>
