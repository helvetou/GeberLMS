<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  const { t } = useI18n();
  import type { PageProps } from './$types';
  let { form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('login.title')} — GeberLMS</title>
</svelte:head>

<header class="flex h-14 items-center justify-between border-b px-4">
  <a href="/" class="font-display text-lg font-semibold">{t('brand.name')}</a>
  <LangSwitch />
</header>

<main class="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-12">
  <h1 class="text-2xl font-semibold">{t('login.title')}</h1>

  <form method="POST" class="flex flex-col gap-3">
    <label class="flex flex-col gap-1 text-sm">
      {t('common.email')}
      <input
        type="email"
        name="email"
        autocomplete="username"
        required
        class="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />
    </label>
    <label class="flex flex-col gap-1 text-sm">
      {t('common.password')}
      <input
        type="password"
        name="password"
        autocomplete="current-password"
        required
        class="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />
    </label>
    <button type="submit" class="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
      {t('login.submit')}
    </button>
  </form>

  {#if form?.error}
    <p role="alert" class="text-sm text-destructive">{form.error}</p>
  {/if}
</main>
