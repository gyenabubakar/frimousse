import { preloadFile } from '@pierre/diffs/ssr';
import type { SupportedLanguages } from '@pierre/diffs';
import { readableTokens } from '$lib/contrast';

const OPTIONS = {
  theme: { dark: 'pierre-dark', light: 'pierre-light' },
  themeType: 'system',
  overflow: 'scroll',
} as const;

/** Where the shared Pierre stylesheet is served (src/pages/diffs.css.ts). */
export const DIFFS_STYLESHEET = '/diffs.css';

const CORE_STYLE = /<style data-core-css="">([\s\S]*?)<\/style>/;

/**
 * Renders a code block with @pierre/diffs. Every block carries the same 31 KB core stylesheet in its shadow
 * root; it is swapped for a link to one shared, cached file so the page doesn't repeat it 27 times.
 */
export async function renderCode(code: string, lang: SupportedLanguages, title?: string) {
  const { prerenderedHTML } = await preloadFile({
    file: { name: title ?? `snippet.${lang}`, contents: code, lang },
    options: { ...OPTIONS, disableFileHeader: !title },
  });

  return readableTokens(prerenderedHTML).replace(
    CORE_STYLE,
    `<link rel="stylesheet" href="${DIFFS_STYLESHEET}">`,
  );
}

/** Pierre's core stylesheet, the same for every code block. */
export async function diffsStylesheet() {
  const { prerenderedHTML } = await preloadFile({
    file: { name: 'snippet.ts', contents: 'const x = 1;', lang: 'ts' },
    options: { ...OPTIONS, disableFileHeader: true },
  });
  const css = prerenderedHTML.match(CORE_STYLE)?.[1];

  if (!css) {
    throw new Error('@pierre/diffs output has no core stylesheet; update src/lib/diffs.ts.');
  }

  return css;
}
