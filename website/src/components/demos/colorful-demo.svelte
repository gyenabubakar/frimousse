<script lang="ts">
  import { EmojiPicker } from '@gyen/frimousse';
</script>

<EmojiPicker.Root
  class="isolate flex h-92 w-fit flex-col rounded-lg border bg-white shadow-md dark:bg-neutral-900"
>
  <EmojiPicker.Search
    class="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 px-2.5 py-2 text-sm dark:bg-neutral-800"
  />
  <EmojiPicker.Viewport class="relative flex-1 outline-hidden">
    <EmojiPicker.List class="colorful pb-1.5 select-none">
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
        <button {...props} class="flex size-8 items-center justify-center rounded-md text-lg">
          {emoji.emoji}
        </button>
      {/snippet}
    </EmojiPicker.List>
  </EmojiPicker.Viewport>
</EmojiPicker.Root>

<style>
  /* Odd rows go red, green, blue; even rows start at blue so columns don't share a color. */
  :global(
    .colorful [frimousse-row]:nth-child(odd) [frimousse-emoji]:nth-child(3n + 1)[data-active]
  ),
  :global(
    .colorful [frimousse-row]:nth-child(even) [frimousse-emoji]:nth-child(3n + 2)[data-active]
  ) {
    background: oklch(0.65 0.2 15 / 16%);
  }
  :global(
    .colorful [frimousse-row]:nth-child(odd) [frimousse-emoji]:nth-child(3n + 2)[data-active]
  ),
  :global(.colorful [frimousse-row]:nth-child(even) [frimousse-emoji]:nth-child(3n)[data-active]) {
    background: oklch(0.75 0.2 130 / 20%);
  }
  :global(.colorful [frimousse-row]:nth-child(odd) [frimousse-emoji]:nth-child(3n)[data-active]),
  :global(
    .colorful [frimousse-row]:nth-child(even) [frimousse-emoji]:nth-child(3n + 1)[data-active]
  ) {
    background: oklch(0.65 0.15 240 / 18%);
  }
</style>
