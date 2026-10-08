<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import { useI18n } from '$lib/i18n.svelte';
	import type { Component } from 'svelte';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import LibraryIcon from '@lucide/svelte/icons/library';
	import UsersIcon from '@lucide/svelte/icons/users';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import TicketIcon from '@lucide/svelte/icons/ticket';
	import ListChecksIcon from '@lucide/svelte/icons/list-checks';

	const { t } = useI18n();

	let { role }: { role: 'admin' | 'learner' | 'tutor' } = $props();

	type NavItem = { href: string; label: string; icon: Component };

	const items = $derived<NavItem[]>(
		role === 'admin'
			? [
					{ href: '/admin/courses', label: t('courses.title'), icon: LibraryIcon },
					{ href: '/admin/users', label: t('users.title'), icon: UsersIcon },
					{ href: '/admin/enroll', label: t('enroll.title'), icon: UserPlusIcon },
					{ href: '/admin/payments', label: t('payments.title'), icon: CreditCardIcon },
					{ href: '/admin/coupons', label: t('coupons.title'), icon: TicketIcon },
					{ href: '/admin/quizzes', label: t('quizzes.title'), icon: ListChecksIcon },
				]
			: role === 'tutor'
				? [{ href: '/tutor', label: t('tutor.title'), icon: LayoutDashboardIcon }]
				: [
						{ href: '/learner', label: t('learner.title'), icon: LayoutDashboardIcon },
						{ href: '/catalog', label: t('nav.catalog'), icon: GraduationCapIcon },
					],
	);

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<Sidebar.Menu>
	{#each items as item (item.href)}
		{@const Icon = item.icon}
		<Sidebar.MenuItem>
			<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
				{#snippet child({ props })}
					<a href={item.href} {...props}>
						<Icon />
						<span>{item.label}</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	{/each}
</Sidebar.Menu>
