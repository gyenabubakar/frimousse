<script lang="ts">
  import MoonIcon from '~icons/ph/moon-duotone';
  import SunIcon from '~icons/ph/sun-duotone';

  function toggle() {
    const dark = !document.documentElement.classList.contains('dark');

    function apply() {
      document.documentElement.classList.toggle('dark', dark);
    }

    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply();
    } else document.startViewTransition(apply);
  }
</script>

<button
  type="button"
  onclick={toggle}
  class="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
  aria-label="Toggle dark mode"
>
  <SunIcon class="size-4.25 dark:hidden" />
  <MoonIcon class="hidden size-4.25 dark:block" />
</button>
