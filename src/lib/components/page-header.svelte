<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    subtitle,
    actions,
  }: {
    title: string;
    subtitle?: string;
    actions?: Snippet;
  } = $props();
</script>

<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
  <div class="space-y-1">
    <h1 class="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
    {#if subtitle}
      <p class="text-sm text-muted-foreground md:text-base">{subtitle}</p>
    {/if}
  </div>
  {#if actions}
    <div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
  {/if}
</div>
