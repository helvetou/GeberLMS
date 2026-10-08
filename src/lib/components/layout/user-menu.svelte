<script lang="ts">
	import { goto } from '$app/navigation';

import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { useI18n } from '$lib/i18n.svelte';

	const { t } = useI18n();

	let {
		user,
	}: {
		user: { name?: string | null; email: string; role: string };
	} = $props();

	const displayName = $derived(user.name ?? user.email);
	const initials = $derived(
		displayName
			.split(/[\s@._-]/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase() ?? '')
			.join(''),
	);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="rounded-full">
				<Avatar.Root class="size-8">
					<Avatar.Fallback>{initials}</Avatar.Fallback>
				</Avatar.Root>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-56">
		<DropdownMenu.Label>
			<span class="block truncate font-medium">{displayName}</span>
			<span class="block truncate text-xs text-muted-foreground">{user.email}</span>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item variant="destructive" onSelect={() => goto('/logout')}>
			{t('nav.logout')}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
