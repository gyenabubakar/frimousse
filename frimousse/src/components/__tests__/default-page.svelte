<!--
  The test page for the component tests, like the React version's `DefaultPage`.
  Snippets can't be written inline in a test file, so the custom list parts are picked by name.
-->
<script lang="ts">
  import * as EmojiPicker from '../emoji-picker.js';
  import type {
    Emoji,
    EmojiPickerListCategoryHeaderProps,
    EmojiPickerListEmojiProps,
    EmojiPickerListRowProps,
    EmojiPickerRootProps,
  } from '../../types.js';

  const EMOJI_BUTTON_HEIGHT = 28;

  type Props = Pick<EmojiPickerRootProps, 'locale' | 'skinTone' | 'resolveEmojiData' | 'sticky'> & {
    columns?: number;
    emojiVersion?: number;
    viewportHeight?: number;
    search?: string;
    emojiVariant?: 'default' | 'testid' | 'active-only' | 'label' | 'highlight';
    rowVariant?: 'default' | 'custom-row' | 'count' | 'labelled';
    rowHeight?: number;
    categoryHeaderVariant?: 'default' | 'testid' | 'custom' | 'sized';
    categoryHeaderHeight?: number;
    emptyVariant?: 'default' | 'search';
    extraPart?: 'active-emoji' | 'skin-tone' | 'skin-tone-selector';
    skinToneSelectorEmoji?: string;
  };

  let {
    locale,
    columns = 10,
    skinTone = $bindable(),
    emojiVersion = 12,
    resolveEmojiData,
    sticky = true,
    viewportHeight = 400,
    search = $bindable(''),
    emojiVariant = 'default',
    rowVariant = 'default',
    rowHeight = 30,
    categoryHeaderVariant = 'default',
    categoryHeaderHeight = 30,
    emptyVariant = 'default',
    extraPart,
    skinToneSelectorEmoji,
  }: Props = $props();

  let selectedEmoji = $state<Emoji | null>(null);
</script>

{#snippet emoji({ emoji, props }: EmojiPickerListEmojiProps)}
  <button
    {...props}
    data-testid={emojiVariant === 'testid' || emojiVariant === 'active-only'
      ? `emoji: ${emoji.emoji}`
      : emojiVariant === 'label'
        ? `custom-emoji: ${emoji.emoji}`
        : undefined}
    style="{props.style ?? ''} height: {EMOJI_BUTTON_HEIGHT}px;{emojiVariant === 'highlight' &&
    emoji.isActive
      ? ' background: red;'
      : ''}"
  >
    {#if emojiVariant === 'label'}
      {emoji.label}
    {:else if emojiVariant !== 'active-only' || emoji.isActive}
      {emoji.emoji}
    {/if}
  </button>
{/snippet}

{#snippet row({ props, children }: EmojiPickerListRowProps)}
  {#if rowVariant === 'custom-row'}
    <div data-testid="custom-row" {...props} style="{props.style ?? ''} height: {rowHeight}px;">
      {@render children()}
    </div>
  {:else if rowVariant === 'labelled'}
    <div {...props} aria-label="Custom row">{@render children()}</div>
  {:else}
    <div {...props}>{@render children()}</div>
  {/if}
{/snippet}

{#snippet categoryHeader({ category, props }: EmojiPickerListCategoryHeaderProps)}
  {#if categoryHeaderVariant === 'custom'}
    <div data-testid="custom-category-header: {category.label}">
      Custom ({category.label})
    </div>
  {:else if categoryHeaderVariant === 'sized'}
    <div
      data-testid="custom-category-header"
      {...props}
      style="{props.style ?? ''} height: {categoryHeaderHeight}px;"
    >
      {category.label}
    </div>
  {:else}
    <div data-testid="category-header" {...props}>{category.label}</div>
  {/if}
{/snippet}

<div>
  <p data-testid="selected-emoji">{selectedEmoji?.emoji}</p>
  <input data-testid="controlled-search" bind:value={search} type="text" />
</div>
<div>
  <EmojiPicker.Root
    {columns}
    data-testid="root"
    {emojiVersion}
    {locale}
    onEmojiSelect={(emoji) => (selectedEmoji = emoji)}
    {resolveEmojiData}
    bind:skinTone
    {sticky}
  >
    <EmojiPicker.Search data-testid="search" bind:value={search} />
    <EmojiPicker.Loading data-testid="loading">Loading…</EmojiPicker.Loading>
    <EmojiPicker.Empty>
      {#snippet children({ search: currentSearch })}
        <div data-testid="empty">
          {emptyVariant === 'search' ? `No emojis found for ${currentSearch}` : 'No emojis found'}
        </div>
      {/snippet}
    </EmojiPicker.Empty>
    <EmojiPicker.Viewport data-testid="viewport" style="height: {viewportHeight}px;">
      <EmojiPicker.List
        data-testid="list"
        {emoji}
        {row}
        categoryHeader={categoryHeaderVariant === 'default' ? undefined : categoryHeader}
      />
    </EmojiPicker.Viewport>
    {#if extraPart === 'active-emoji'}
      <EmojiPicker.ActiveEmoji>
        {#snippet children({ emoji })}
          {#if emoji}<p data-testid="active-emoji">{emoji.label}</p>{/if}
        {/snippet}
      </EmojiPicker.ActiveEmoji>
    {:else if extraPart === 'skin-tone'}
      <EmojiPicker.SkinTone>
        {#snippet children({ skinTone: currentSkinTone, setSkinTone })}
          <div>
            <p data-testid="skin-tone">{currentSkinTone}</p>
            <button
              data-testid="set-skin-tone-dark"
              onclick={() => setSkinTone('dark')}
              type="button"
            >
              Change skin tone to dark
            </button>
          </div>
        {/snippet}
      </EmojiPicker.SkinTone>
    {:else if extraPart === 'skin-tone-selector'}
      <EmojiPicker.SkinToneSelector
        data-testid="skin-tone-selector"
        emoji={skinToneSelectorEmoji}
      />
    {/if}
  </EmojiPicker.Root>
</div>
