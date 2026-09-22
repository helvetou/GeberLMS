<script lang="ts">
  import type { PageProps } from './$types';
  let { form }: PageProps = $props();
</script>

<svelte:head>
  <title>Créer un compte — GeberLMS</title>
</svelte:head>

<h1>Créer un compte</h1>

<form method="POST" action="?/create">
  <label>
    Rôle
    <select name="role">
      <option value="learner">Apprenant</option>
      <option value="tutor">Tuteur</option>
    </select>
  </label>
  <label>Email <input type="email" name="email" required /></label>
  <label>Nom <input type="text" name="name" /></label>
  <label>
    <input type="checkbox" name="selfPayer" />
    Auto-payeur
  </label>
  <label>Mot de passe <input type="password" name="password" autocomplete="new-password" /></label>
  <button type="submit">Créer</button>
</form>

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if form?.ok}
  <p role="status">Compte créé.</p>
{/if}
