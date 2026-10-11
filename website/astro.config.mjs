// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  // Set SITE_URL in the Workers Builds variables. Sitemap, robots.txt and canonical links are built from it.
  site: process.env.SITE_URL ?? 'https://frimousse.gyen.dev',
  integrations: [svelte(), sitemap()],
  // Inline the CSS into each page instead of loading it as render-blocking files.
  build: { inlineStylesheets: 'always' },
  // Compression drops the line break between a word and an inline <a>/<code> on the next line, gluing them together.
  compressHTML: false,
  vite: {
    // Svelte components import icons as `~icons/ph/<name>`; .astro files use src/components/icon.astro.
    plugins: [tailwindcss(), Icons({ compiler: 'svelte' })],
  },
});
