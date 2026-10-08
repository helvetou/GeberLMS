<script lang="ts">
  import AppShell from '$lib/components/layout/app-shell.svelte';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();
</script>

<AppShell user={data.user}>
  {@render children()}
</AppShell>
