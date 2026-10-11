<script lang="ts">
  import { getEmojiPickerStore } from '../store.svelte.js';
  import type { EmojiPickerViewportProps } from '../types.js';

  let {
    ref = $bindable(null),
    onscroll,
    style,
    children,
    ...props
  }: EmojiPickerViewportProps = $props();

  const store = getEmojiPickerStore();
  const rowsCount = $derived(store.data?.rows.length);
  const categoriesCount = $derived(store.data?.categories.length);
  const activeEmoji = $derived(store.activeEmoji);

  $effect(() => {
    const viewport = ref;

    if (!viewport) return;

    store.viewportElement = viewport;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry?.borderBoxSize[0]?.inlineSize ?? 0;
      const height = entry?.borderBoxSize[0]?.blockSize ?? 0;

      if (store.viewportHeight !== height || store.viewportWidth !== width) {
        store.onViewportSizeChange(width, height);
      }
    });

    resizeObserver.observe(viewport);
    store.onViewportSizeChange(viewport.offsetWidth, viewport.clientHeight);

    return () => resizeObserver.disconnect();
  });

  function handleScroll(event: UIEvent & { currentTarget: HTMLDivElement }) {
    onscroll?.(event);
    store.onViewportScroll(event.currentTarget.scrollTop);
  }
</script>

<div
  frimousse-viewport=""
  {...props}
  bind:this={ref}
  onscroll={handleScroll}
  style="position: relative; box-sizing: border-box; contain: layout paint; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; will-change: scroll-position;{typeof rowsCount ===
    'number' && typeof categoriesCount === 'number'
    ? ` contain-intrinsic-size: var(--frimousse-viewport-width, auto) calc(${rowsCount} * var(--frimousse-row-height) + ${categoriesCount} * var(--frimousse-category-header-height));`
    : ''}{style ?? ''}"
>
  {#if activeEmoji}
    <div
      aria-live="polite"
      style="border: 0; clip: rect(0, 0, 0, 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; white-space: nowrap; width: 1px; word-wrap: normal;"
    >
      {activeEmoji.label}
    </div>
  {/if}
  {@render children?.()}
</div>
