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

## Releasing

New versions go through GitHub Actions (`.github/workflows/release.yml`) when you push a tag like `frimousse@0.1.1`.
It runs the full build and all checks and tests, then stages the version on npm (with provenance) and creates a draft
GitHub release from the CHANGELOG. A staged version isn't live until you approve it with your npm 2FA, so a stolen
GitHub login alone can't publish.

### Every release

1. While working, add each user-facing change to `frimousse/CHANGELOG.md` under `## [Unreleased]`, in the same
   commit as the change.
2. Pick the version. While it's `0.x`: patch (`0.1.1`) for fixes, minor (`0.2.0`) for new features or anything that
   breaks existing code.
3. Bump it: `cd frimousse && npm version 0.1.1 --no-git-tag-version`.
4. In the CHANGELOG, rename `## [Unreleased]` to `## [0.1.1] - YYYY-MM-DD` and add a new empty `## [Unreleased]`
   above it.
5. Commit, tag and push:

   ```bash
   git commit -am "chore(release): @gyen/frimousse 0.1.1"
   git tag frimousse@0.1.1
   git push && git push --tags
   ```

6. When the workflow finishes, approve the staged version. Its stage ID is in the output of the "Stage the version on
   npm" step:

   ```bash
   npm stage approve <stage-id>
   ```

   npm asks for your 2FA code, then publishes the version.

7. Publish the draft release on GitHub (Releases → the draft → Publish release).

The workflow stops before staging if the tag doesn't match the version in `frimousse/package.json`, or if any check
fails. If the shadcn component changed, redeploy the site too.

### First release (0.1.0), by hand

Trusted publishing is set up on a package that already exists, so publish the first version from your machine
(logged in with `npm login`):

```bash
pnpm --filter @gyen/frimousse publish --access public
git tag frimousse@0.1.0
git push --tags
```

`prepublishOnly` builds, tests and type-checks first. Pushing the tag runs the release workflow, which sees 0.1.0 is
already on npm and only creates the GitHub release. Then, on npmjs.com, open the package's settings and add a
trusted publisher: GitHub Actions, organization or user `gyenabubakar`, repository `frimousse`, workflow filename
`release.yml`. Under "Allowed actions", leave "Allow npm publish" and "Allow npm dist-tag" unticked: the workflow only
stages. The first release through it must happen within 2 days of setting it up, or the setup expires.

## Deploying the site (Cloudflare Workers Builds)

- Root directory: `website`. Deploy command: `pnpm run deploy` (Wrangler runs the root build first: the library, then
  the site). Every push to `main` deploys.
- Build variables: `PNPM_VERSION=11.28.2`, and optionally `PUBLIC_CF_BEACON_TOKEN`. `SITE_URL` overrides the public
  URL (default `https://frimousse.gyen.dev`), which canonical links and the shadcn command in the docs use.

## License

MIT. The original Frimousse is © Liveblocks; see [LICENSE](./LICENSE).
