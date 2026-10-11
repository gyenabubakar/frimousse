# Frimousse for Svelte

A Svelte 5 port of Liveblocks' [Frimousse](https://frimousse.liveblocks.io) emoji picker, and its docs site.

| Folder       | What it is                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------- |
| `frimousse/` | The library, published as [`@gyen/frimousse`](https://www.npmjs.com/package/@gyen/frimousse) |
| `website/`   | The docs site (Astro + Svelte + Tailwind, on Cloudflare), with the shadcn-svelte registry    |

## Commands

Run from the repo root:

| Command         | What it does                                                                |
| --------------- | --------------------------------------------------------------------------- |
| `pnpm dev`      | Rebuilds the library on change, and runs the docs site on :4321             |
| `pnpm build`    | Builds the library (then runs publint), the registry, and the site          |
| `pnpm test`     | Library tests: unit (jsdom), server rendering (Node), components (Chromium) |
| `pnpm test:e2e` | End-to-end tests of the built site (run `pnpm build` first)                 |
| `pnpm check`    | Format, type-check (svelte-check, astro check), and lint with fixes         |
| `pnpm check:ci` | The same, without changing files                                            |

The site uses the library's `dist/`, so build the library once before the first `pnpm dev`. The browser tests need
Chromium: `pnpm --filter @gyen/frimousse exec playwright install chromium-headless-shell` for the library and
`pnpm --filter website exec playwright install chromium` for the site.

Commits run lint-staged (ESLint + Prettier on staged files) and commitlint (conventional commits, scopes in
`commitlint.config.js`) through Husky.

## shadcn-svelte registry

The `emoji-picker` item lives in `website/src/lib/registry/emoji-picker/` and is listed in `website/registry.json`.
`pnpm build` writes it to `website/public/r/emoji-picker.json`, so the site serves it at `/r/emoji-picker.json`:

```bash
npx shadcn-svelte@latest add https://frimousse.gyen.dev/r/emoji-picker.json
```

## Publishing the library

```bash
pnpm --filter @gyen/frimousse publish --access public
```

`prepublishOnly` builds, tests and type-checks first.

## Deploying the site (Cloudflare Workers Builds)

- Root directory: `website`. Deploy command: `npx wrangler deploy --experimental-new-config`.
- Build variables: `PNPM_VERSION=11.28.2`, and optionally `PUBLIC_CF_BEACON_TOKEN`. `SITE_URL` overrides the public
  URL (default `https://frimousse.gyen.dev`), which canonical links and the shadcn command in the docs use.

## License

MIT. The original Frimousse is © Liveblocks; see [LICENSE](./LICENSE).
