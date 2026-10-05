<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t } = useI18n();
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('enroll.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('enroll.title')}</h1>

<form method="POST" action="?/enroll">
  <label>{t('enroll.email')} <input type="email" name="learnerEmail" required /></label>
  <label>
    {t('enroll.course')}
    <select name="courseId" required>
      {#each data.courses as c (c.id)}
        <option value={c.id}>{c.title}</option>
      {/each}
    </select>
  </label>
  <label>{t('enroll.coupon')} <input type="text" name="couponCode" /></label>
  <button type="submit">{t('enroll.submit')}</button>
</form>

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if form?.ok}
  <p role="status">{t('enroll.created', { amount: form.totalCents / 100 })}</p>
{/if}
