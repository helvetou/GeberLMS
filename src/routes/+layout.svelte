<script lang="ts">
  import { initI18n } from '$lib/i18n.svelte';
  import { LOCALES } from '$lib/domain/i18n';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  // Lis la locale dans une fonction pour que l'initialisation soit explicite et
  // SSR-sûre (la locale ne change que via une navigation complète).
  function initI18nContext() {
    return initI18n(data.locale);
  }

  const i18n = initI18nContext();

  function submitLocale(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    select.form?.requestSubmit();
  }
</script>

<div class="app">
  <header class="app-header">
    <span class="brand">{i18n.t('brand.name')}</span>
    <form method="GET" action="/" class="lang-switch">
      <label>
        {i18n.t('lang.label')}
        <select name="locale" onchange={submitLocale}>
          {#each LOCALES as code (code)}
            <option value={code} selected={code === i18n.locale}>
              {i18n.t(`lang.${code}`)}
            </option>
          {/each}
        </select>
      </label>
    </form>
  </header>

  <main>
    {@render children()}
  </main>
</div>

<style>
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #ddd;
  }

  .brand {
    font-weight: 700;
  }
</style>
