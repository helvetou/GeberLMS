<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t } = useI18n();
  import type { PageProps } from './$types';
  let { form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('users.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('users.title')}</h1>

<form method="POST" action="?/create">
  <label>
    {t('users.role')}
    <select name="role">
      <option value="learner">{t('users.learner')}</option>
      <option value="tutor">{t('users.tutor')}</option>
    </select>
  </label>
  <label>{t('common.email')} <input type="email" name="email" required /></label>
  <label>{t('common.name')} <input type="text" name="name" /></label>
  <label>
    <input type="checkbox" name="selfPayer" />
    {t('users.selfPayer')}
  </label>
  <label>{t('common.password')} <input type="password" name="password" autocomplete="new-password" /></label>
  <button type="submit">{t('common.create')}</button>
</form>

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if form?.ok}
  <p role="status">{t('users.created')}</p>
{/if}
