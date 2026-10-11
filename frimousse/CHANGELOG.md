## [Unreleased]

## [0.1.1] - 2026-10-11

- Fix the list staying filtered by the old search text after `EmojiPicker.Search` is removed (for example, hidden with `{#if}`). The original Frimousse keeps the old search in this case.

## [0.1.0] - 2026-10-11

First release: a Svelte 5 port of [Frimousse](https://github.com/liveblocks/frimousse) 0.4.0 by Liveblocks.

- Add the `EmojiPicker` parts: `Root`, `Search`, `Viewport`, `List`, `Loading`, `Empty`, `SkinToneSelector`, `SkinTone` and `ActiveEmoji`, with the same `[frimousse-*]` attributes and CSS variables as the React version.
- Add snippets on `EmojiPicker.List` (`categoryHeader`, `row`, `emoji`) in place of the `components` prop.
- Add `bind:value` on `EmojiPicker.Search`, `bind:skinTone` on `EmojiPicker.Root`, and a bindable `ref` on element parts.
- Add `useSkinTone` and `useActiveEmoji`, which return reactive objects.
- Add `defaultEmojiDataResolver`, `createEmojiDataCache`, `getEmojiDetails`, and `loadEmojiDetails` (the promise-based version of `useEmojiDetails`).
- Count `aria-rowindex` and `aria-colindex` from 1, as ARIA requires (the React version starts at 0).
