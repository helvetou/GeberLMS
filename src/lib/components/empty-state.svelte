<script lang="ts">
  import type { Component } from 'svelte';

  let {
    icon: Icon,
    title,
    description,
  }: {
    icon: Component;
    title: string;
    description?: string;
  } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center">
  <div class="rounded-full bg-muted p-3 text-muted-foreground">
    <Icon class="size-6" />
  </div>
  <p class="font-medium">{title}</p>
  {#if description}
    <p class="max-w-sm text-sm text-muted-foreground">{description}</p>
  {/if}
</div>
