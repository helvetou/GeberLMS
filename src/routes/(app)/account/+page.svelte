<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import * as Card from '$lib/components/ui/card/index.js';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('account.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('account.title')}</h1>
<p class="text-muted-foreground">{data.user.email}</p>

{#if form?.error}
  <p role="alert">{tError(form.error)}</p>
{/if}
{#if form?.ok && form.consentSaved}
  <p role="status">{t('account.consentSaved')}</p>
{/if}

<Card.Root class="mt-4 max-w-lg">
  <Card.Content class="space-y-4 py-4">
    <form method="POST" action="?/consent" class="space-y-3">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="marketing" />
        {t('account.marketing')}
      </label>
      <button type="submit" class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        {t('account.saveConsent')}
      </button>
    </form>

    <hr class="border-border" />

    <div class="flex flex-wrap gap-2">
      <form method="POST" action="?/export">
        <button type="submit" class="rounded-md border px-3 py-1.5 text-sm">{t('account.export')}</button>
      </form>
      <form method="POST" action="?/erase" onsubmit={(e) => { if (!confirm('Confirmer la suppression de vos données ?')) e.preventDefault(); }}>
        <button type="submit" class="rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive">
          {t('account.erase')}
        </button>
      </form>
    </div>
  </Card.Content>
</Card.Root>
