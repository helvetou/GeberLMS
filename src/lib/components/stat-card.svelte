<script lang="ts">
  import type { Component } from 'svelte';
  import * as Card from '$lib/components/ui/card/index.js';

  let {
    icon: Icon,
    label,
    value,
    tone = 'default',
  }: {
    icon: Component;
    label: string;
    value: string | number;
    tone?: 'default' | 'primary' | 'success' | 'warning';
  } = $props();

  const toneClass = $derived(
    tone === 'primary'
      ? 'bg-primary/10 text-primary'
      : tone === 'success'
        ? 'bg-success/10 text-success'
        : tone === 'warning'
          ? 'bg-amber-500/10 text-amber-600'
          : 'bg-muted text-muted-foreground',
  );
</script>

<Card.Root>
  <Card.Content class="flex items-center gap-3 py-4">
    <div class="rounded-lg p-2 {toneClass}">
      <Icon class="size-5" />
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm text-muted-foreground">{label}</p>
      <p class="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  </Card.Content>
</Card.Root>
