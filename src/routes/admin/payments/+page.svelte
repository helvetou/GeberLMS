<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Paiements — GeberLMS</title>
</svelte:head>

<h1>Inscriptions & paiements</h1>

{#if data.error}
  <p role="alert">{data.error}</p>
{/if}

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if form?.ok && form.invoiceNumber}
  <p role="status">Paiement confirmé — facture {form.invoiceNumber}.</p>
{/if}

{#if data.enrollments.length === 0}
  <p>Aucune inscription.</p>
{:else}
  <ul>
    {#each data.enrollments as e (e.enrollmentId)}
      <li>
        <strong>{e.learnerName}</strong> ({e.learnerEmail})
        — {e.courseTitle}
        — {e.totalCents / 100} €
        — <em>{e.status}</em>
        {#if e.status === 'pending'}
          <form method="POST" action="?/markPaid" style="display: inline">
            <input type="hidden" name="enrollmentId" value={e.enrollmentId} />
            <button type="submit">Marquer payé (Payoneer)</button>
          </form>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
