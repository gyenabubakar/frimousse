import { getContext, setContext } from 'svelte';
import type { Emoji, EmojiPickerData, EmojiPickerEmoji, Locale, SkinTone } from './types.js';

const VIEWPORT_OVERSCAN = 2;
const CONTEXT_KEY = Symbol('frimousse');

type Interaction = 'keyboard' | 'pointer' | 'none';

export class EmojiPickerStore {
  locale = $state<Locale>('en');
  columns = $state(9);
  sticky = $state(true);
  skinTone = $state<SkinTone>('none');
  onEmojiSelect: (emoji: Emoji) => void;

  // `undefined` means there is no data to show (e.g. empty search results are still data).
  data = $state.raw<EmojiPickerData | null | undefined>(null);
  search = $state('');
  interaction = $state<Interaction>('none');
  activeColumnIndex = $state(0);
  activeRowIndex = $state(0);

  rowHeight = $state<number | null>(null);
  categoryHeaderHeight = $state<number | null>(null);
  viewportWidth = $state<number | null>(null);
  viewportHeight = $state<number | null>(null);

  viewportStartCategoryIndex = $state(0);
  viewportStartRowIndex = $state(0);
  viewportEndRowIndex = $state(0);

  searchElement: HTMLInputElement | null = null;
  viewportElement: HTMLDivElement | null = null;
  listElement: HTMLDivElement | null = null;

  #viewportScrollY = 0;

  activeEmoji = $derived.by((): EmojiPickerEmoji | undefined => {
    if (this.interaction === 'none') return undefined;

    return this.data?.rows[this.activeRowIndex]?.emojis[this.activeColumnIndex];
  });

  isEmpty = $derived(this.data === undefined || this.data?.count === 0);

  isLoading = $derived(
    this.data === null ||
      this.viewportHeight === null ||
      this.rowHeight === null ||
      this.categoryHeaderHeight === null,
  );

  constructor(onEmojiSelect: (emoji: Emoji) => void) {
    this.onEmojiSelect = onEmojiSelect;
  }

  updateViewportState() {
    const { data, categoryHeaderHeight, rowHeight, viewportHeight } = this;

    if (!data || data.rows.length === 0 || !categoryHeaderHeight || !rowHeight || !viewportHeight) {
      this.viewportStartCategoryIndex = 0;
      this.viewportStartRowIndex = 0;
      this.viewportEndRowIndex = 0;

      return;
    }

    let previousCategoryHeadersHeight = 0;
    let categoryIndex = 0;

    for (const category of data.categories) {
      const categoryY = categoryIndex++ * categoryHeaderHeight + category.startRowIndex * rowHeight;

      if (categoryY >= this.#viewportScrollY) break;

      previousCategoryHeadersHeight += categoryHeaderHeight;
    }

    const totalHeight =
      data.categories.length * categoryHeaderHeight + data.rows.length * rowHeight;
    const overscanStart = Math.floor((VIEWPORT_OVERSCAN * rowHeight) / 2);
    const overscanEnd = Math.ceil((VIEWPORT_OVERSCAN * rowHeight) / 2);

    // Adjust the scroll position to account for previous category headers
    const viewportStartY = Math.min(
      this.#viewportScrollY - previousCategoryHeadersHeight - overscanStart,
      totalHeight - viewportHeight,
    );
    const viewportEndY = viewportStartY + viewportHeight + overscanEnd;
    const viewportStartRowIndex = Math.max(0, Math.floor(viewportStartY / rowHeight));
    const viewportStartCategoryIndex = data.rows[viewportStartRowIndex]?.categoryIndex;

    if (viewportStartCategoryIndex === undefined) return;

    this.viewportStartCategoryIndex = viewportStartCategoryIndex;
    this.viewportStartRowIndex = viewportStartRowIndex;
    this.viewportEndRowIndex = Math.min(data.rows.length - 1, Math.ceil(viewportEndY / rowHeight));
  }

  onDataChange(data: EmojiPickerData) {
    this.data = data;

    // Reset active emoji when data changes
    this.activeColumnIndex = 0;
    this.activeRowIndex = 0;
    this.updateViewportState();
  }

  onSearchChange(search: string) {
    this.search = search;
    this.interaction = search ? 'keyboard' : 'none';
  }

  onActiveEmojiChange(
    interaction: Exclude<Interaction, 'none'>,
    activeColumnIndex: number,
    activeRowIndex: number,
  ) {
    this.interaction = interaction;
    this.activeColumnIndex = activeColumnIndex;
    this.activeRowIndex = activeRowIndex;

    if (interaction === 'keyboard') this.#scrollToRow(activeRowIndex);
  }

  onActiveEmojiReset() {
    this.interaction = 'none';

    // Reset active emoji when interaction goes back to none
    this.activeColumnIndex = 0;
    this.activeRowIndex = 0;
  }

  onRowHeightChange(rowHeight: number) {
    this.rowHeight = rowHeight;
    this.updateViewportState();
  }

  onCategoryHeaderHeightChange(categoryHeaderHeight: number) {
    this.categoryHeaderHeight = categoryHeaderHeight;
    this.updateViewportState();
  }

  onViewportSizeChange(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.updateViewportState();
  }

  onViewportScroll(scrollY: number) {
    this.#viewportScrollY = scrollY;
    this.updateViewportState();
  }

  #scrollToRow(rowIndex: number) {
    const {
      listElement: list,
      viewportElement: viewport,
      sticky,
      rowHeight,
      viewportHeight,
      categoryHeaderHeight,
    } = this;

    if (!list || !viewport || !rowHeight || !categoryHeaderHeight || !viewportHeight) {
      return;
    }

    if (rowIndex === 0) viewport.scrollTo({ top: 0, behavior: 'instant' });

    const row = list.querySelector(`[aria-rowindex="${rowIndex}"]`);

    if (!(row instanceof HTMLElement)) return;

    const rowY = row.offsetTop;
    const rowStyle = getComputedStyle(row);
    const rowScrollMarginTop = Number.parseFloat(rowStyle.scrollMarginTop);
    const rowScrollMarginBottom = Number.parseFloat(rowStyle.scrollMarginBottom);
    let viewportStartY = this.#viewportScrollY + rowScrollMarginTop;

    // Account for headers if they are sticky and if the row is in the upper half of the viewport
    if (sticky && rowY < this.#viewportScrollY + viewportHeight / 2) {
      viewportStartY += categoryHeaderHeight;
    }

    const viewportEndY = viewportStartY + viewportHeight - rowScrollMarginBottom;

    if (rowY >= viewportStartY && rowY + rowHeight <= viewportEndY) return;

    // Align to the viewport's top or bottom based on the row's position
    const top =
      rowY < viewportStartY + categoryHeaderHeight
        ? rowY - Math.max(sticky ? categoryHeaderHeight : 0, rowScrollMarginTop)
        : rowY - viewportHeight + rowHeight + rowScrollMarginBottom;

    viewport.scrollTo({ top: Math.max(top, 0), behavior: 'instant' });
  }
}

export function setEmojiPickerStore(store: EmojiPickerStore) {
  setContext(CONTEXT_KEY, store);
}

export function getEmojiPickerStore(): EmojiPickerStore {
  const store = getContext<EmojiPickerStore | undefined>(CONTEXT_KEY);

  if (!store) throw new Error('EmojiPicker.Root is missing.');

  return store;
}
