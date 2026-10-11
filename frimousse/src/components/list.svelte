<script lang="ts">
  import { getEmojiPickerStore } from '../store.svelte.js';
  import type {
    Category,
    EmojiPickerAttributes,
    EmojiPickerEmoji,
    EmojiPickerListCategoryHeaderProps,
    EmojiPickerListEmojiProps,
    EmojiPickerListProps,
    EmojiPickerListRowProps,
  } from '../types.js';

  let {
    ref = $bindable(null),
    style,
    emoji: emojiSnippet,
    row: rowSnippet,
    categoryHeader: categoryHeaderSnippet,
    ...props
  }: EmojiPickerListProps = $props();

  const store = getEmojiPickerStore();
  const SIZER_CATEGORY: Category = { label: 'Category' };

  let rowSizer = $state<HTMLDivElement | null>(null);
  let categoryHeaderSizer = $state<HTMLDivElement | null>(null);

  const rows = $derived(store.data?.rows ?? []);
  const categories = $derived(store.data?.categories ?? []);
  const categoriesStartRowIndices = $derived(store.data?.categoriesStartRowIndices ?? []);
  const hasRows = $derived(rows.length > 0 && categories.length > 0);
  const previousHeadersCount = $derived(
    categoriesStartRowIndices.filter((index) => index < store.viewportStartRowIndex).length,
  );
  const visibleRowIndices = $derived(
    hasRows
      ? Array.from(
          {
            length: store.viewportEndRowIndex - store.viewportStartRowIndex + 1,
          },
          (_, index) => store.viewportStartRowIndex + index,
        )
      : [],
  );
  const sizerEmojis = $derived(
    Array<EmojiPickerEmoji>(store.columns).fill({ emoji: '🙂', label: '' }),
  );

  $effect(() => {
    store.listElement = ref;
  });

  $effect(() => {
    const row = rowSizer;
    const categoryHeader = categoryHeaderSizer;

    if (!row || !categoryHeader) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;

        if (entry.target === row && store.rowHeight !== height) {
          store.onRowHeightChange(height);
        }

        if (entry.target === categoryHeader && store.categoryHeaderHeight !== height) {
          store.onCategoryHeaderHeightChange(height);
        }
      }
    });

    resizeObserver.observe(row);
    resizeObserver.observe(categoryHeader);
    store.onRowHeightChange(row.clientHeight);
    store.onCategoryHeaderHeightChange(categoryHeader.clientHeight);

    return () => resizeObserver.disconnect();
  });

  function emojiProps(
    emoji: EmojiPickerEmoji,
    columnIndex: number,
    isActive: boolean,
  ): EmojiPickerListEmojiProps['props'] {
    return {
      role: 'gridcell',
      'aria-colindex': columnIndex,
      'aria-selected': isActive || undefined,
      'aria-label': emoji.label,
      'data-active': isActive ? '' : undefined,
      'frimousse-emoji': '',
      style: 'font-family: var(--frimousse-emoji-font);',
      tabindex: -1,
    };
  }

  function interactiveEmojiProps(
    emoji: EmojiPickerEmoji,
    columnIndex: number,
    rowIndex: number,
  ): EmojiPickerListEmojiProps['props'] {
    const isActive = isEmojiActive(columnIndex, rowIndex);

    return {
      ...emojiProps(emoji, columnIndex, isActive),
      onclick: () => store.onEmojiSelect(emoji),
      onpointerdown: (event) => event.preventDefault(),
      onpointerenter: () => store.onActiveEmojiChange('pointer', columnIndex, rowIndex),
      onpointerleave: () => store.onActiveEmojiReset(),
    };
  }

  function isEmojiActive(columnIndex: number, rowIndex: number) {
    return (
      store.interaction !== 'none' &&
      store.activeRowIndex === rowIndex &&
      store.activeColumnIndex === columnIndex
    );
  }

  function rowProps(rowIndex: number, sizer = false): EmojiPickerAttributes<HTMLDivElement> {
    return {
      role: sizer ? undefined : 'row',
      'aria-rowindex': sizer ? undefined : rowIndex,
      'frimousse-row': '',
      style: sizer
        ? 'display: flex;'
        : 'contain: content; height: var(--frimousse-row-height); display: flex;',
    };
  }

  function categoryHeaderProps(
    sizer = false,
    sticky = true,
  ): EmojiPickerAttributes<HTMLDivElement> {
    return {
      'frimousse-category-header': '',
      style: `${sizer ? '' : 'contain: layout paint; height: var(--frimousse-category-header-height); '}pointer-events: auto;${sticky ? ' position: sticky;' : ''} top: 0;`,
    };
  }

  function categoryStyle(categoryIndex: number) {
    const category = categories[categoryIndex];
    const position = category
      ? `top: calc(${categoryIndex} * var(--frimousse-category-header-height) + ${category.startRowIndex} * var(--frimousse-row-height)); height: calc(var(--frimousse-category-header-height) + ${category.rowsCount} * var(--frimousse-row-height)); `
      : '';

    return `contain: content; ${position}width: 100%; pointer-events: none; position: absolute;`;
  }
</script>

{#snippet defaultEmoji({ emoji, props: attributes }: EmojiPickerListEmojiProps)}
  <button type="button" {...attributes}>{emoji.emoji}</button>
{/snippet}

{#snippet defaultRow({ props: attributes, children }: EmojiPickerListRowProps)}
  <div {...attributes}>{@render children()}</div>
{/snippet}

{#snippet defaultCategoryHeader({
  category,
  props: attributes,
}: EmojiPickerListCategoryHeaderProps)}
  <div {...attributes}>{category.label}</div>
{/snippet}

{#snippet sizerEmojisContent()}
  {#each sizerEmojis as emoji, index (index)}
    {@render (emojiSnippet ?? defaultEmoji)({
      emoji: { ...emoji, isActive: false },
      props: emojiProps(emoji, index, false),
    })}
  {/each}
{/snippet}

<div
  aria-colcount={store.columns}
  aria-rowcount={hasRows ? rows.length : 0}
  frimousse-list=""
  role="grid"
  {...props}
  bind:this={ref}
  style="--frimousse-list-columns: {store.columns};{style ?? ''}"
>
  <div
    frimousse-list-sizer=""
    style="position: relative; box-sizing: border-box; height: calc({hasRows
      ? rows.length
      : 0} * var(--frimousse-row-height) + {hasRows
      ? categories.length
      : 0} * var(--frimousse-category-header-height)); padding-top: calc({hasRows
      ? store.viewportStartRowIndex
      : 0} * var(--frimousse-row-height) + {hasRows
      ? previousHeadersCount
      : 0} * var(--frimousse-category-header-height));"
  >
    <div aria-hidden="true" style="height: 0; visibility: hidden;">
      <div frimousse-row-sizer="" bind:this={rowSizer}>
        {@render (rowSnippet ?? defaultRow)({
          props: rowProps(-1, true),
          children: sizerEmojisContent,
        })}
      </div>
      <div frimousse-category="" style={categoryStyle(-1)}>
        <div frimousse-category-header-sizer="" bind:this={categoryHeaderSizer}>
          {@render (categoryHeaderSnippet ?? defaultCategoryHeader)({
            category: SIZER_CATEGORY,
            props: categoryHeaderProps(true),
          })}
        </div>
      </div>
    </div>
    {#each visibleRowIndices as rowIndex (rowIndex)}
      {#snippet rowEmojis()}
        {#each rows[rowIndex]?.emojis ?? [] as emoji, columnIndex (columnIndex)}
          {@render (emojiSnippet ?? defaultEmoji)({
            emoji: { ...emoji, isActive: isEmojiActive(columnIndex, rowIndex) },
            props: interactiveEmojiProps(emoji, columnIndex, rowIndex),
          })}
        {/each}
      {/snippet}
      {#if categoriesStartRowIndices.includes(rowIndex)}
        <div style="height: var(--frimousse-category-header-height);"></div>
      {/if}
      {#if rows[rowIndex]}
        {@render (rowSnippet ?? defaultRow)({
          props: rowProps(rowIndex),
          children: rowEmojis,
        })}
      {/if}
    {/each}
    {#each categories as category, categoryIndex (categoryIndex)}
      <div frimousse-category="" style={categoryStyle(categoryIndex)}>
        {@render (categoryHeaderSnippet ?? defaultCategoryHeader)({
          category: { label: category.label },
          props: categoryHeaderProps(false, store.sticky),
        })}
      </div>
    {/each}
  </div>
</div>
