<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import LangSwitch from './lang-switch.svelte';
	import ThemeToggle from './theme-toggle.svelte';
	import UserMenu from './user-menu.svelte';

	let {
		user,
	}: {
		user: { name?: string | null; email: string; role: string };
	} = $props();
</script>

<header class="flex h-14 items-center gap-2 border-b px-4">
	<Sidebar.Trigger />
	<div class="mx-1 h-6 w-px bg-border" aria-hidden="true"></div>
	<div class="flex-1"></div>
	<LangSwitch />
	<ThemeToggle />
	<UserMenu {user} />
</header>
