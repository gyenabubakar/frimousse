// Pierre's themes have token colors below WCAG AA contrast (4.5:1) on our code block backgrounds.
// These helpers move such a color toward black (light theme) or white (dark theme) just until it passes,
// so each token keeps its hue.

const MIN_CONTRAST = 4.6;

/** The code block backgrounds: `--card` in global.css, light and dark. */
export const CODE_BACKGROUND = { light: '#ffffff', dark: '#1d1a17' } as const;

type Rgb = [number, number, number];

function parse(hex: string): Rgb {
  const value = hex.replace('#', '');

  return [0, 2, 4].map((start) => Number.parseInt(value.slice(start, start + 2), 16)) as Rgb;
}

function format(rgb: Rgb) {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(rgb: Rgb) {
  const [red, green, blue] = rgb.map((channel) => {
    const value = channel / 255;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as Rgb;

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrast(foreground: string, background: string) {
  const [lighter, darker] = [luminance(parse(foreground)), luminance(parse(background))].sort(
    (first, second) => second - first,
  ) as [number, number];

  return (lighter + 0.05) / (darker + 0.05);
}

/** Returns `color`, or the closest color with the same hue that reaches 4.6:1 on `background`. */
export function readable(color: string, background: string) {
  if (contrast(color, background) >= MIN_CONTRAST) return color;

  const target: Rgb = luminance(parse(background)) > 0.5 ? [0, 0, 0] : [255, 255, 255];
  const start = parse(color);

  for (let step = 1; step <= 100; step++) {
    const amount = step / 100;
    const mixed = start.map(
      (channel, index) => channel + (target[index]! - channel) * amount,
    ) as Rgb;

    if (contrast(format(mixed), background) >= MIN_CONTRAST) return format(mixed);
  }

  return format(target);
}

/** Makes every Pierre token color in rendered HTML readable on its theme's background. */
export function readableTokens(html: string) {
  return html.replace(
    /--diffs-token-(dark|light):(#[0-9a-fA-F]{6})/g,
    (_, theme: 'dark' | 'light', color: string) =>
      `--diffs-token-${theme}:${readable(color, CODE_BACKGROUND[theme])}`,
  );
}
