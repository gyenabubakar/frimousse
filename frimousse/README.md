# @gyen/frimousse

A lightweight, unstyled, and composable emoji picker for Svelte 5.

A Svelte port of [Frimousse](https://frimousse.liveblocks.io) by [Liveblocks](https://liveblocks.io). It has the same parts, data attributes and CSS variables, and keeps its behaviour: Emojibase data fetched and cached in the browser, emoji support detection, skin tones, keyboard navigation, virtualized rows, sticky category headers and locales.

## Installation

```bash
npm i @gyen/frimousse
```

With [shadcn-svelte](https://shadcn-svelte.com), you can add a styled version instead:

```bash
npx shadcn-svelte@latest add https://frimousse.gyen.dev/r/emoji-picker.json
```

## Usage

```svelte
<script lang="ts">
  import { EmojiPicker } from '@gyen/frimousse';
</script>

<EmojiPicker.Root onEmojiSelect={({ emoji }) => console.log(emoji)}>
  <EmojiPicker.Search />
  <EmojiPicker.Viewport>
    <EmojiPicker.Loading>Loading…</EmojiPicker.Loading>
    <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

The parts have no styles. Style them with classes, or with the `[frimousse-*]` attributes on each part. Change how the list's category headers, rows and emoji buttons look with snippets:

```svelte
<EmojiPicker.List>
  {#snippet categoryHeader({ category, props })}
    <div {...props}>{category.label}</div>
  {/snippet}
  {#snippet row({ props, children })}
    <div {...props}>{@render children()}</div>
  {/snippet}
  {#snippet emoji({ emoji, props })}
    <button {...props}>{emoji.emoji}</button>
  {/snippet}
</EmojiPicker.List>
```

## Differences from the React version

- Render props are snippets (`EmojiPicker.List`'s `components` prop becomes the `categoryHeader`, `row` and `emoji` snippets).
- `EmojiPicker.Search` uses `bind:value`, and `EmojiPicker.Root` supports `bind:skinTone`.
- Element parts have a bindable `ref`.
- `useSkinTone()` and `useActiveEmoji()` return objects with a reactive `current`.
- `useEmojiDetails` is `loadEmojiDetails`, which returns a promise (use it with `{#await}`).

See [frimousse.gyen.dev](https://frimousse.gyen.dev) for the full API reference.

## Credits

This is a port of [Frimousse](https://github.com/liveblocks/frimousse) by Liveblocks, released under the MIT license. The emoji data comes from [Emojibase](https://emojibase.dev).

## License

MIT. See [LICENSE](./LICENSE).
