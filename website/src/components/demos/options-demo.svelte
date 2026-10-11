<script lang="ts">
  import { EmojiPicker } from '@gyen/frimousse';
  import type { Locale, SkinTone } from '@gyen/frimousse';
  import * as StyledPicker from '$lib/registry/emoji-picker';

  const LOCALES: [Locale, string][] = [
    ['en', 'English'],
    ['fr', 'Français'],
    ['de', 'Deutsch'],
    ['es', 'Español'],
    ['ja', '日本語'],
    ['zh', '中文'],
  ];

  const SKIN_TONES: SkinTone[] = ['none', 'light', 'medium-light', 'medium', 'medium-dark', 'dark'];

  let locale = $state<Locale>('en');
  let columns = $state(9);
  let sticky = $state(true);
  let skinTone = $state<SkinTone>('none');
</script>

<div class="flex flex-col items-center gap-5 md:flex-row md:items-start">
  <StyledPicker.Root
    class="h-85.5 rounded-lg border shadow-md"
    {locale}
    {columns}
    {sticky}
    bind:skinTone
  >
    <div class="flex items-center gap-1 border-b pr-2">
      <StyledPicker.Search class="flex-1 border-b-0" />
      <EmojiPicker.SkinToneSelector
        class="grid size-7 place-items-center rounded-sm text-base hover:bg-accent"
      />
    </div>
    <StyledPicker.Content />
    <StyledPicker.Footer />
  </StyledPicker.Root>

  <form class="grid w-56 gap-4 text-sm" onsubmit={(event) => event.preventDefault()}>
    <label class="grid gap-1.5">
      <span class="label-mono">locale</span>
      <select bind:value={locale} class="h-8 rounded-md border bg-background px-2">
        {#each LOCALES as [value, label] (value)}
          <option {value}>{label}</option>
        {/each}
      </select>
    </label>
    <label class="grid gap-1.5">
      <span class="label-mono">columns · {columns}</span>
      <input type="range" min="6" max="12" bind:value={columns} class="accent-ember" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={sticky} class="accent-ember" />
      <span>Sticky category headers</span>
    </label>
    <label class="grid gap-1.5">
      <span class="label-mono">bind:skinTone</span>
      <select bind:value={skinTone} class="h-8 rounded-md border bg-background px-2">
        {#each SKIN_TONES as value (value)}
          <option {value}>{value}</option>
        {/each}
      </select>
      <span class="text-xs text-muted-foreground">
        Also changes when you press the ✋ button in the picker.
      </span>
    </label>
  </form>
</div>
