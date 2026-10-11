<script lang="ts">
  import { EmojiPicker } from '@gyen/frimousse';
</script>

<EmojiPicker.Root class="isolate flex h-92 w-fit flex-col bg-white dark:bg-neutral-900">
  <EmojiPicker.Search
    class="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 px-2.5 py-2 text-sm dark:bg-neutral-800"
  />
  <EmojiPicker.Viewport class="relative flex-1 outline-hidden">
    <EmojiPicker.Loading
      class="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500"
    >
      Loading…
    </EmojiPicker.Loading>
    <EmojiPicker.Empty
      class="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500"
    >
      No emoji found.
    </EmojiPicker.Empty>
    <EmojiPicker.List class="pb-1.5 select-none">
      {#snippet categoryHeader({ category, props })}
        <div
          {...props}
          class="bg-white px-3 pt-3 pb-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
        >
          {category.label}
        </div>
      {/snippet}
      {#snippet row({ props, children })}
        <div {...props} class="scroll-my-1.5 px-1.5">{@render children()}</div>
      {/snippet}
      {#snippet emoji({ emoji, props })}
        <button
          {...props}
          class="flex size-8 items-center justify-center rounded-md text-lg data-active:bg-neutral-100 dark:data-active:bg-neutral-800"
        >
          {emoji.emoji}
        </button>
      {/snippet}
    </EmojiPicker.List>
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
