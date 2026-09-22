<script lang="ts">
  import type { PageProps } from './$types';
  let { form }: PageProps = $props();
</script>

<svelte:head>
  <title>Connexion — GeberLMS</title>
</svelte:head>

<h1>Connexion</h1>

<form method="POST">
  <label>
    Email
    <input type="email" name="email" autocomplete="username" required />
  </label>
  <label>
    Mot de passe
    <input type="password" name="password" autocomplete="current-password" required />
  </label>
  <button type="submit">Se connecter</button>
</form>

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}
