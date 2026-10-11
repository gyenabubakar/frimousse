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
