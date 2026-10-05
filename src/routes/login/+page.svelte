<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t } = useI18n();
  import type { PageProps } from './$types';
  let { form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('login.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('login.title')}</h1>

<form method="POST">
  <label>
    {t('common.email')}
    <input type="email" name="email" autocomplete="username" required />
  </label>
  <label>
    {t('common.password')}
    <input type="password" name="password" autocomplete="current-password" required />
  </label>
  <button type="submit">{t('login.submit')}</button>
</form>

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}
