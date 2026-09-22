<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  function labelValue(type: string, value: number): string {
    return type === 'percent' ? `${value} %` : `€${value / 100}`;
  }
</script>

<svelte:head>
  <title>Coupons — GeberLMS</title>
</svelte:head>

<h1>Coupons</h1>

{#if data.error}
  <p role="alert">{data.error}</p>
{/if}

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

<h2>Nouveau coupon</h2>
<form method="POST" action="?/create">
  <label>Code <input type="text" name="code" required /></label>
  <label>
    Type
    <select name="type">
      <option value="percent">%</option>
      <option value="amount">montant</option>
    </select>
  </label>
  <label>Valeur <input type="number" name="value" min="0" required /></label>
  <label>Expiration <input type="date" name="expiresAt" /></label>
  <label>Utilisations max <input type="number" name="maxUses" min="0" /></label>
  <button type="submit">Créer</button>
</form>

<hr />

<h2>Existants</h2>
{#if data.coupons.length === 0}
  <p>Aucun coupon.</p>
{:else}
  <ul>
    {#each data.coupons as c (c.id)}
      <li>
        <strong>{c.code}</strong> — {labelValue(c.type, c.value)}
        {#if !c.enabled}<span> (désactivé)</span>{/if}
        {#if c.maxUses !== null}
          <span> — {c.usedCount}/{c.maxUses} utilisations</span>
        {:else}
          <span> — {c.usedCount} utilisations</span>
        {/if}
        {#if c.expiresAt}<span> — expire le {c.expiresAt}</span>{/if}
      </li>
    {/each}
  </ul>
{/if}
