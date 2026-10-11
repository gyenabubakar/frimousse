import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import DefaultPage from './default-page.svelte';

// Astro and SvelteKit render the picker on the server first, where there is no DOM, storage or canvas.
describe('EmojiPicker on the server', () => {
  it('should render the parts in their loading state without loading data', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { body } = render(DefaultPage);

    expect(body).toContain('frimousse-root');
    expect(body).toContain('frimousse-search');
    expect(body).toContain('frimousse-viewport');
    expect(body).toContain('role="grid"');
    expect(body).toContain('Loading…');
    expect(body).not.toContain('role="row"');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should render the current skin tone in the selector', () => {
    const { body } = render(DefaultPage, {
      props: { extraPart: 'skin-tone-selector', skinTone: 'dark' },
    });

    expect(body).toContain('✋🏿');
  });

  it('should render the list with the columns prop', () => {
    const { body } = render(DefaultPage, { props: { columns: 7 } });

    expect(body).toContain('aria-colcount="7"');
    expect(body).toContain('--frimousse-list-columns: 7;');
  });
});
