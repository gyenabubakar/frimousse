import 'svelte/elements';

declare module 'svelte/elements' {
  // Frimousse marks each part with a `frimousse-*` attribute for styling.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- merging needs the same type parameter name
  interface HTMLAttributes<T> {
    [attribute: `frimousse-${string}`]: string | number | undefined;
  }
}
