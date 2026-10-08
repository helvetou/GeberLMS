<script lang="ts">
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	const isDark = $derived(mode.current === 'dark');
</script>

<Button variant="ghost" size="icon" onclick={() => toggleMode()} aria-label="Toggle theme">
	{#if isDark}
		<SunIcon class="size-4" />
	{:else}
		<MoonIcon class="size-4" />
	{/if}
	<span class="sr-only">Toggle theme</span>
</Button>
