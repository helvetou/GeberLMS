<script lang="ts">
  import { initI18n } from '$lib/i18n.svelte';
  import type { LayoutProps } from './$types';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { data, children }: LayoutProps = $props();

  // Initialise le contexte i18n (locale + direction) pour toute l'app.
  function initI18nContext() {
    return initI18n(data.locale);
  }

  const i18n = initI18nContext();
</script>

<ModeWatcher />
<Toaster />
{@render children()}
