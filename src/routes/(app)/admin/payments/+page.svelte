<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus } = useI18n();
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('payments.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('payments.title')}</h1>

{#if data.error}
  <p role="alert">{data.error}</p>
{/if}

{#if form?.error}
  <p role="alert">{form.error}</p>
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
