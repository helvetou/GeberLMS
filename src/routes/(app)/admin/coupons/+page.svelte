<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  function labelValue(type: string, value: number): string {
    return type === 'percent' ? `${value} %` : `€${value / 100}`;
  }
</script>

<svelte:head>
  <title>{t('coupons.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('coupons.title')}</h1>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{/if}

{#if form?.error}
  <p role="alert">{tError(form.error)}</p>
{/if}

<h2>{t('coupons.new')}</h2>
<form method="POST" action="?/create">
  <label>{t('coupons.code')} <input type="text" name="code" required /></label>
  <label>
    {t('coupons.type')}
    <select name="type">
      <option value="percent">{t('coupons.percent')}</option>
      <option value="amount">{t('coupons.amount')}</option>
    </select>
  </label>
  <label>{t('coupons.value')} <input type="number" name="value" min="0" required /></label>
  <label>{t('coupons.expiration')} <input type="date" name="expiresAt" /></label>
  <label>{t('coupons.maxUses')} <input type="number" name="maxUses" min="0" /></label>
  <button type="submit">{t('common.create')}</button>
</form>

<hr />

<h2>{t('coupons.existing')}</h2>
{#if data.coupons.length === 0}
  <p>{t('coupons.none')}</p>
{:else}
  <ul>
    {#each data.coupons as c (c.id)}
      <li>
        <strong>{c.code}</strong> — {labelValue(c.type, c.value)}
        {#if !c.enabled}<span> ({t('coupons.disabled')})</span>{/if}
        {#if c.maxUses !== null}
          <span> — {c.usedCount}/{c.maxUses} {t('coupons.uses')}</span>
        {:else}
          <span> — {c.usedCount} {t('coupons.uses')}</span>
        {/if}
        {#if c.expiresAt}<span> — {t('coupons.expires', { date: c.expiresAt })}</span>{/if}
        <form method="POST" action="?/toggle" style="display: inline">
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="enabled" value={!c.enabled} />
          <button type="submit">{c.enabled ? t('coupons.disable') : t('coupons.enable')}</button>
        </form>
      </li>
    {/each}
  </ul>
{/if}
