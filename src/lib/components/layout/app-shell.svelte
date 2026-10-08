<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useI18n } from '$lib/i18n.svelte';
	import SidebarNav from './sidebar-nav.svelte';
	import Topbar from './topbar.svelte';
	import type { Snippet } from 'svelte';

	const { t } = useI18n();

	let {
		user,
		children,
	}: {
		user: { id: string; role: 'admin' | 'learner' | 'tutor'; email: string; name?: string | null };
		children: Snippet;
	} = $props();
</script>

<Sidebar.Provider>
	<Sidebar.Root>
		<Sidebar.Header>
			<a href="/" class="flex items-center gap-2 px-2 py-1.5 font-display text-lg font-semibold">
				{t('brand.name')}
			</a>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<SidebarNav role={user.role} />
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>

	<Sidebar.Inset>
		<Topbar {user} />
		<div class="flex-1 p-4 md:p-6">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
