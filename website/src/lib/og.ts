import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

// Satori reads TTF/OTF/WOFF, not WOFF2, so these come from the static @fontsource builds.
// Resolved from the website folder: this module is bundled at build time, so import.meta.url moves.
function font(file: string) {
  return readFileSync(join(process.cwd(), 'node_modules/@fontsource', file));
}

const fonts = [
  {
    name: 'Merriweather',
    weight: 700,
    data: font('merriweather/files/merriweather-latin-700-normal.woff'),
  },
  { name: 'Geist', weight: 400, data: font('geist/files/geist-latin-400-normal.woff') },
  { name: 'Geist', weight: 500, data: font('geist/files/geist-latin-500-normal.woff') },
] as const;

const color = {
  background: '#0f0d0b',
  ink: '#f0eeeb',
  muted: '#a39e97',
  ember: '#ff723a',
  line: '#2a2622',
};

type Node = { type: string; props: Record<string, unknown> };

// Satori only lays out flex; every box defaults to it.
function node(type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node {
  return { type, props: { style: { display: 'flex', ...style }, children } };
}

export type Card = { label: string; title: string; description: string };

const TILE = 64;
const TILE_GAP = 14;
const TILE_COLUMNS = 6;
const TILE_ROWS = 7;

/** A ghosted grid of emoji buttons on the right, with one lit in ember like the picker's active emoji. */
function tiles() {
  const rows = Array.from({ length: TILE_ROWS }, (_, row) =>
    node(
      'div',
      { gap: TILE_GAP },
      ...Array.from({ length: TILE_COLUMNS }, (__, column) => {
        const isActive = row === 3 && column === 2;

        return node('div', {
          width: TILE,
          height: TILE,
          borderRadius: 14,
          border: `2px solid ${isActive ? color.ember : color.line}`,
          backgroundColor: isActive ? 'rgba(255, 114, 58, 0.16)' : 'transparent',
        });
      }),
    ),
  );

  return node(
    'div',
    {
      position: 'absolute',
      top: -40,
      right: -60,
      flexDirection: 'column',
      gap: TILE_GAP,
      transform: 'rotate(-8deg)',
    },
    ...rows,
  );
}

export async function renderCard({ label, title, description }: Card) {
  const card = node(
    'div',
    {
      position: 'relative',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: color.background,
      // The same grid paper as the site's demo frames.
      backgroundImage: `linear-gradient(${color.line} 1px, transparent 1px), linear-gradient(90deg, ${color.line} 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      borderBottom: `8px solid ${color.ember}`,
      fontFamily: 'Geist',
    },
    tiles(),
    // Fades the pattern out behind the text, so the words stay easy to read.
    node('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `linear-gradient(90deg, ${color.background} 30%, rgba(15, 13, 11, 0.85) 55%, rgba(15, 13, 11, 0) 100%)`,
    }),
    node(
      'div',
      { fontFamily: 'Merriweather', fontSize: 34 },
      node('span', { color: color.ink, fontWeight: 700 }, 'frimousse'),
      node('span', { color: color.muted, fontFamily: 'Geist', fontWeight: 400 }, '/svelte'),
    ),
    node(
      'div',
      { flexDirection: 'column', gap: 22 },
      node(
        'div',
        {
          color: color.ember,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: 4,
          textTransform: 'uppercase',
        },
        // Non-breaking spaces: satori treats "·" as a break point and swallows the space after it.
        label.replaceAll(' ', ' '),
      ),
      node(
        'div',
        {
          color: color.ink,
          fontFamily: 'Merriweather',
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.15,
        },
        title,
      ),
      node(
        'div',
        { color: color.muted, fontSize: 30, lineHeight: 1.4, maxWidth: 980 },
        description,
      ),
    ),
  );

  const svg = await satori(card as never, { width: 1200, height: 630, fonts: [...fonts] });

  return new Resvg(svg).render().asPng();
}
