<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Inscrire à un cours — GeberLMS</title>
</svelte:head>

<h1>Inscrire un apprenant à un cours</h1>

<form method="POST" action="?/enroll">
  <label>Email apprenant <input type="email" name="learnerEmail" required /></label>
  <label>
    Cours
    <select name="courseId" required>
      {#each data.courses as c (c.id)}
        <option value={c.id}>{c.title}</option>
      {/each}
    </select>
  </label>
  <button type="submit">Inscrire</button>
</form>

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if form?.ok}
  <p role="status">Inscription créée.</p>
{/if}
