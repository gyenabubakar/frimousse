<!-- Calls the hooks from inside a picker, and shows what they return. -->
<script lang="ts">
  import { useActiveEmoji, useSkinTone } from '../../hooks.svelte.js';

  let { emoji }: { emoji?: string } = $props();

  const activeEmoji = useActiveEmoji();
  const skinTone = useSkinTone(() => emoji);
</script>

<p data-testid="hook-active-emoji">{activeEmoji.current?.label ?? 'none'}</p>
<p data-testid="hook-skin-tone">{skinTone.current}</p>
<p data-testid="hook-variations">
  {skinTone.variations.map((variation) => variation.emoji).join(' ')}
</p>
<button data-testid="hook-set-dark" type="button" onclick={() => (skinTone.current = 'dark')}>
  Dark
</button>
