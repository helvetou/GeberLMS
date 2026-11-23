<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('payments.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('payments.title')}</h1>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{/if}

{#if form?.error}
  <p role="alert">{tError(form.error)}</p>
{/if}

{#if form?.ok && form.invoiceNumber}
  <p role="status">{t('payments.confirmed', { number: form.invoiceNumber })}</p>
{/if}

{#if data.enrollments.length === 0}
  <p>{t('payments.none')}</p>
{:else}
  <ul>
    {#each data.enrollments as e (e.enrollmentId)}
      <li>
        <strong>{e.learnerName}</strong> ({e.learnerEmail})
        — {e.courseTitle}
        — {e.totalCents / 100} €
        — <em>{tStatus(e.status)}</em>
        {#if e.status === 'pending'}
          <form method="POST" action="?/markPaid" style="display: inline">
            <input type="hidden" name="enrollmentId" value={e.enrollmentId} />
            <button type="submit">{t('payments.markPaid')}</button>
          </form>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<h2 class="mt-6 text-lg font-semibold">{t('payments.invoices')}</h2>
{#if (data.invoices ?? []).length === 0}
  <p class="text-muted-foreground">{t('payments.none')}</p>
{:else}
  <table class="mt-2 w-full text-sm">
    <thead>
      <tr class="text-left text-muted-foreground">
        <th class="py-1 pr-2">{t('payments.invoice')}</th>
        <th class="py-1 pr-2">{t('common.email')}</th>
        <th class="py-1 pr-2">{t('common.title')}</th>
        <th class="py-1 pr-2">{t('payments.total')}</th>
        <th class="py-1">{t('payments.date')}</th>
      </tr>
    </thead>
    <tbody>
      {#each data.invoices as inv (inv.id)}
        <tr class="border-t">
          <td class="py-1 pr-2 font-mono">{inv.number}</td>
          <td class="py-1 pr-2">{inv.learnerEmail}</td>
          <td class="py-1 pr-2">{inv.courseTitle}</td>
          <td class="py-1 pr-2">€{(inv.totalCents / 100).toFixed(2)} <span class="text-xs text-muted-foreground">(TVA {inv.vatRatePercent} %)</span></td>
          <td class="py-1">{inv.createdAt}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
