<script lang="ts">
  import { getEmojiPickerStore } from '../store.svelte.js';
  import type { EmojiPickerSearchProps } from '../types.js';

  let {
    value = $bindable(''),
    ref = $bindable(null),
    oninput,
    ...props
  }: EmojiPickerSearchProps = $props();

  const store = getEmojiPickerStore();

  $effect.pre(() => {
    store.onSearchChange(value ?? '');
  });

  $effect(() => {
    store.searchElement = ref;
  });

  // When the search input is removed (e.g. hidden with {#if}), stop filtering the list by its old text.
  // Upstream Frimousse keeps the old search in this case.
  $effect(() => () => {
    store.searchElement = null;
    store.onSearchChange('');
  });

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    oninput?.(event);

    if (!event.defaultPrevented) value = event.currentTarget.value;
  }
</script>

<input
  autocapitalize="off"
  autocomplete="off"
  autocorrect="off"
  enterkeyhint="done"
  frimousse-search=""
  placeholder="Search…"
  spellcheck={false}
  type="search"
  {...props}
  bind:this={ref}
  {value}
  oninput={handleInput}
/>
