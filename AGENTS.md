# AGENTS.md

Notes for AI coding agents working on this repo. Humans: see README.md.

## What this is

A Svelte 5 port of Liveblocks' [Frimousse](https://github.com/liveblocks/frimousse) (React, MIT), published as
`@gyen/frimousse`, plus its docs site at https://frimousse.gyen.dev.

- `frimousse/`: the library. Svelte 5 runes, TypeScript, built with `@sveltejs/package`.
- `website/`: the docs site (Astro + Svelte + Tailwind v4, Cloudflare) and the shadcn-svelte registry.

## Stay close to upstream

- `frimousse/src/data/` and `frimousse/src/utils/` are Liveblocks' code with as few changes as possible. Keep them
  close to upstream so their fixes are easy to bring over. Don't restyle or rename things there.
- Behaviour must match Frimousse: the `[frimousse-*]` attributes, `data-*` attributes, CSS variables, ARIA roles,
  keyboard navigation, caching and data loading. Changing any of these is a breaking change.
- When Svelte needs a different API, follow the React one as closely as Svelte allows (snippets for render props,
  `bind:` for controlled values, a bindable `ref`), then add it to "Differences from React" in
  `website/src/pages/index.astro` and in `frimousse/README.md`.
- When porting an upstream feature, port its tests too.

## Library rules

- Relative imports need the `.js` ending (`./types.js`, `./store.svelte.js`). `./x.svelte` component imports stay
  as they are. The library's tsconfig uses `nodenext` so svelte-check fails without them; consumers using
  `moduleResolution: "nodenext"` can't load the types otherwise.
- `EmojiPicker.Root` must render correctly on the server (SvelteKit, Astro): effects don't run there, so any prop
  that affects markup must also be read when the component is created. `ssr.test.server.ts` checks this.
- Keep the package free of runtime dependencies. `svelte` is the only peer dependency.
- Write a CHANGELOG entry (`frimousse/CHANGELOG.md`) for every user-facing change.

## Tests

Read every module a test depends on before writing it.

| Where                                | Runs in                   | For                                        |
| ------------------------------------ | ------------------------- | ------------------------------------------ |
| `frimousse/src/**/*.test.ts`         | jsdom                     | data and utils                             |
| `frimousse/src/**/*.test.server.ts`  | Node (server render)      | server rendering                           |
| `frimousse/src/**/*.test.browser.ts` | Chromium                  | components and hooks                       |
| `website/e2e/*.spec.ts`              | Chromium, desktop + phone | the built site, its demos and the registry |

- Component tests render `default-page.svelte` or `hooks-page.svelte`. Snippets can't be written in a test file,
  so add a named variant to the test page instead.
- The test setup serves Emojibase data from the local `emojibase-data@16` package, so tests never use the network.
  Expected labels and versions come from that version.
- Vitest's text matchers match the whole text, case-sensitive, including hidden characters like `U+FE0F` (`🐈️`).
- End-to-end tests run against the built site: run `pnpm build` first. Demos below the fold load when scrolled
  into view; use `openDemo()` in `website/e2e/docs.spec.ts` before using one.

## Website rules

- The landing page (`website/src/pages/index.astro`) is the whole documentation, on one page, with the table of
  contents on the right. No left sidebar. When an API changes, update the API reference there, and the `toc` list
  at the top of the file when you add or rename a section.
- The site uses the library's `dist/`. Run `pnpm --filter @gyen/frimousse build` (or `pnpm dev`, which watches)
  before checking library changes on the site.
- Code examples go through `website/src/components/code-block.astro` (@pierre/diffs). Write Tailwind classes in
  them in v4 form (`h-85.5`, not `h-[342px]`; `data-active:`, not `data-[active]:`); ESLint doesn't check them.
- Each live demo sits in a `DemoFrame` with a `name`, which the end-to-end tests use.
- `website/src/lib/registry/emoji-picker/` is what users install with
  `npx shadcn-svelte@latest add https://frimousse.gyen.dev/r/emoji-picker.json`. It must keep working with the
  user's own shadcn-svelte theme (theme colors only, `$lib/utils.js` for `cn`). `pnpm build` writes it to
  `website/public/r/`; don't edit the files there.
- House style (ESLint) applies to the website only: no single-letter names, function declarations, and path
  aliases (`$lib`, `$components`, …) instead of `../` imports.

## Before you say it's done

Run from the repo root and make sure all of them pass:

```bash
pnpm build
pnpm check:ci
pnpm test
pnpm test:e2e
```

For changes you can see, also open the site (`pnpm dev`) and check them in light and dark mode.

## Writing

Plain, simple English in docs, comments and commit messages: short sentences, common words, no idioms. Commits use
conventional commits with the scopes in `commitlint.config.js`.
