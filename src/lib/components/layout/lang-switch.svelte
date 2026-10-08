<script lang="ts">
	import { LOCALES } from '$lib/domain/i18n';
	import { useI18n } from '$lib/i18n.svelte';
	import { page } from '$app/state';

	const { t, locale } = useI18n();

	function submit(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		select.form?.requestSubmit();
	}
</script>

<form method="GET" action={page.url.pathname} class="flex items-center">
	<label for="lang-switch" class="sr-only">{t('lang.label')}</label>
	<select
		id="lang-switch"
		name="locale"
		onchange={submit}
		class="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
	>
		{#each LOCALES as code (code)}
			<option value={code} selected={code === locale}>{t(`lang.${code}`)}</option>
		{/each}
	</select>
</form>
