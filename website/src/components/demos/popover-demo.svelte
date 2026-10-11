<script lang="ts">
  import { Popover } from 'bits-ui';
  import * as EmojiPicker from '$lib/registry/emoji-picker';

  let open = $state(false);
  let picked = $state('');
</script>

<div class="flex items-center gap-3">
  <Popover.Root bind:open>
    <Popover.Trigger
      class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
    >
      Open emoji picker
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        sideOffset={6}
        class="z-50 rounded-lg border bg-popover shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
      >
        <EmojiPicker.Root
          class="h-85.5"
          onEmojiSelect={({ emoji }) => {
            picked = emoji;
            open = false;
          }}
        >
          <EmojiPicker.Search />
          <EmojiPicker.Content />
          <EmojiPicker.Footer />
        </EmojiPicker.Root>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
  {#if picked}
    <span class="text-2xl" data-testid="popover-picked">{picked}</span>
  {/if}
</div>
