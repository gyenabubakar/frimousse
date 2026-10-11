import { renderCard } from '$lib/og';
import { site } from '$site';

// The share card, rendered at build time. base.astro points og:image and twitter:image at it.
export async function GET() {
  const png = await renderCard({
    label: 'Svelte 5 · unstyled · composable',
    title: 'An emoji picker for Svelte',
    description: `${site.description} A port of Frimousse by Liveblocks.`,
  });

  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
