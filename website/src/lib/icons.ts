import ph from '@iconify-json/ph/icons.json';
import { getIconData, iconToHTML, iconToSVG, replaceIDs } from '@iconify/utils';
import type { IconifyIconCustomisations } from '@iconify/utils';

const sets = { ph } as const;

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

/** `iconify` frontmatter: iconify customisations plus a Phosphor `weight`. */
export type IconOptions = IconifyIconCustomisations & { weight?: IconWeight };

/**
 * Renders "ph-bell" (or "ph:bell") to an SVG string at build time.
 * Phosphor weights are separate icons on Iconify ("bell-duotone"), so `weight` picks the variant; default duotone.
 */
export function renderIcon(
  spec: string,
  { weight = 'duotone', ...customisations }: IconOptions = {},
  className = '',
) {
  const [prefix, ...rest] = spec.includes(':') ? spec.split(':') : spec.split('-');
  const set = sets[prefix as keyof typeof sets];

  if (!set) {
    throw new Error(`Unknown icon set "${prefix}" in "${spec}". Add it to src/lib/icons.ts.`);
  }

  const base = rest.join('-');
  const name = weight === 'regular' ? base : `${base}-${weight}`;
  const data = getIconData(set, name);
  if (!data) throw new Error(`Icon "${prefix}:${name}" not found.`);

  const { attributes, body } = iconToSVG(data, { height: '1em', ...customisations });

  return iconToHTML(replaceIDs(body), {
    ...attributes,
    class: className,
    'aria-hidden': 'true',
    fill: 'currentColor',
  });
}
