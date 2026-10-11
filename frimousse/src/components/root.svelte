<script lang="ts">
  import { untrack } from 'svelte';
  import { EMOJI_FONT_FAMILY } from '../constants.js';
  import { resolveCustomEmojiData } from '../data/emoji-data-store.js';
  import { getEmojiPickerData } from '../data/emoji-picker.js';
  import { defaultEmojiDataResolver, validateSkinTone } from '../data/emoji.js';
  import { EmojiPickerStore, setEmojiPickerStore } from '../store.svelte.js';
  import { noop } from '../utils/noop.js';
  import { requestIdleCallback } from '../utils/request-idle-callback.js';
  import type { EmojiData, EmojiPickerRootProps } from '../types.js';

  let {
    locale = 'en',
    columns = 9,
    // No fallback: Svelte refuses `bind:skinTone={undefined}` on a bindable prop with one.
    skinTone = $bindable(),
    onEmojiSelect = noop,
    emojiVersion,
    emojibaseUrl,
    resolveEmojiData,
    sticky = true,
    ref = $bindable(null),
    onfocuscapture,
    onblurcapture,
    style,
    children,
    ...props
  }: EmojiPickerRootProps = $props();

  const store = new EmojiPickerStore((emoji) => onEmojiSelect(emoji));
  let isFocusedWithin = $state(false);
  let emojiData = $state.raw<EmojiData>();

  // Derived so that a parent passing new props with the same values doesn't reload data.
  const currentEmojiVersion = $derived(emojiVersion);
  const currentEmojibaseUrl = $derived(emojibaseUrl);

  setEmojiPickerStore(store);

  // Effects don't run during server rendering, so start from the props here; the effects below keep them in sync.
  untrack(() => {
    store.locale = locale;
    store.columns = columns;
    store.sticky = sticky;
    store.skinTone = validateSkinTone(skinTone ?? 'none');
  });

  $effect.pre(() => {
    store.locale = locale;
  });

  $effect.pre(() => {
    store.columns = columns;
  });

  $effect.pre(() => {
    store.sticky = sticky;
  });

  $effect.pre(() => {
    store.skinTone = validateSkinTone(skinTone ?? 'none');
  });

  // Keeps `bind:skinTone` in sync when the skin tone changes from inside the picker.
  $effect.pre(() => {
    const current = store.skinTone;

    untrack(() => {
      if (skinTone !== current) skinTone = current;
    });
  });

  $effect(() => {
    const currentLocale = store.locale;
    const options = {
      emojiVersion: currentEmojiVersion,
      emojibaseUrl: currentEmojibaseUrl,
    };
    const controller = new AbortController();
    const signal = controller.signal;

    // The resolver is read after the effect has started, so changing the function alone doesn't reload data.
    Promise.resolve()
      .then(() => {
        const resolver = resolveEmojiData ?? defaultEmojiDataResolver;

        return resolver === defaultEmojiDataResolver
          ? defaultEmojiDataResolver(currentLocale, { ...options, signal })
          : resolveCustomEmojiData(resolver, currentLocale, {
              ...options,
              signal,
            });
      })
      .then((data) => {
        if (!signal.aborted) emojiData = data;
      })
      .catch((error: unknown) => {
        if (!signal.aborted) console.error(error);
      });

    return () => controller.abort();
  });

  $effect(() => {
    if (!emojiData) return;

    const data = emojiData;
    const { columns: currentColumns, skinTone: currentSkinTone, search } = store;

    return requestIdleCallback(
      () => {
        store.onDataChange(getEmojiPickerData(data, currentColumns, currentSkinTone, search));
      },
      { timeout: 100 },
    );
  });

  $effect.pre(() => {
    if (!isFocusedWithin) untrack(() => store.onActiveEmojiReset());
  });

  $effect(() => {
    if (!isFocusedWithin) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  function handleFocusCapture(event: FocusEvent & { currentTarget: HTMLDivElement }) {
    onfocuscapture?.(event);

    if (event.defaultPrevented || !(event.target instanceof Element)) return;

    const target = event.target;
    const isSearch = target === store.searchElement || target.hasAttribute('frimousse-search');
    const isViewport =
      target === store.viewportElement || target.hasAttribute('frimousse-viewport');

    isFocusedWithin = isSearch || isViewport;

    if (isViewport) {
      store.onActiveEmojiChange('keyboard', 0, 0);
    } else if (isSearch && store.search === '') {
      store.interaction = 'none';
    }
  }

  function handleBlurCapture(event: FocusEvent & { currentTarget: HTMLDivElement }) {
    onblurcapture?.(event);

    if (
      !event.defaultPrevented &&
      !event.currentTarget.contains(event.relatedTarget as Node | null)
    ) {
      isFocusedWithin = false;
    }
  }

  function getNextActivePosition(key: string): [number, number] {
    const { data, activeColumnIndex, activeRowIndex } = store;
    let columnIndex = activeColumnIndex;
    let rowIndex = activeRowIndex;
    const rows = data?.rows ?? [];

    if (rows.length === 0) return [columnIndex, rowIndex];

    switch (key) {
      case 'ArrowLeft': {
        const previousRow = rows[rowIndex - 1];

        // If first column, move to last column of previous row (if available)
        if (columnIndex > 0) {
          columnIndex -= 1;
        } else if (previousRow) {
          rowIndex -= 1;
          columnIndex = previousRow.emojis.length - 1;
        }

        break;
      }

      case 'ArrowRight': {
        const nextRow = rows[rowIndex + 1];

        // If last column, move to first column of next row (if available)
        if (columnIndex < (rows[rowIndex]?.emojis.length ?? 0) - 1) {
          columnIndex += 1;
        } else if (nextRow) {
          rowIndex += 1;
          columnIndex = 0;
        }

        break;
      }

      case 'ArrowUp':
      case 'ArrowDown': {
        const nextRowIndex = rowIndex + (key === 'ArrowUp' ? -1 : 1);
        const nextRow = rows[nextRowIndex];

        // If the next row doesn't have the same column, move to its last column
        if (nextRow) {
          rowIndex = nextRowIndex;
          columnIndex = Math.min(columnIndex, nextRow.emojis.length - 1);
        }

        break;
      }
    }

    return [columnIndex, rowIndex];
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || (!event.key.startsWith('Arrow') && event.key !== 'Enter')) {
      return;
    }

    // Select the active emoji with enter if it exists
    if (event.key === 'Enter') {
      const activeEmoji = store.activeEmoji;

      if (activeEmoji) {
        event.preventDefault();
        store.onEmojiSelect(activeEmoji);
      }

      return;
    }

    event.preventDefault();

    if (store.interaction === 'none') {
      store.onActiveEmojiChange('keyboard', 0, 0);

      return;
    }

    const [columnIndex, rowIndex] = getNextActivePosition(event.key);

    store.onActiveEmojiChange('keyboard', columnIndex, rowIndex);
  }
</script>

<div
  data-focused={isFocusedWithin ? '' : undefined}
  frimousse-root=""
  {...props}
  bind:this={ref}
  onfocuscapture={handleFocusCapture}
  onblurcapture={handleBlurCapture}
  style="--frimousse-emoji-font: {EMOJI_FONT_FAMILY};{style ?? ''}"
  style:--frimousse-viewport-width={store.viewportWidth === null
    ? undefined
    : `${store.viewportWidth}px`}
  style:--frimousse-viewport-height={store.viewportHeight === null
    ? undefined
    : `${store.viewportHeight}px`}
  style:--frimousse-row-height={store.rowHeight === null ? undefined : `${store.rowHeight}px`}
  style:--frimousse-category-header-height={store.categoryHeaderHeight === null
    ? undefined
    : `${store.categoryHeaderHeight}px`}
>
  {@render children?.()}
</div>
