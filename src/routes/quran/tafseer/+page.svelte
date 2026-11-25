<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('quran.title')} — GeberLMS</title>
</svelte:head>

<div class="min-h-svh bg-muted/40">
  <header class="flex h-14 items-center justify-between border-b bg-background px-4">
    <a href="/quran/" class="font-display text-lg font-semibold">{t('quran.title')}</a>
    <div class="flex items-center gap-2">
      <LangSwitch />
      <Button variant="ghost" href="/login">{t('login.title')}</Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-5xl px-4 py-8">
    <h1 class="font-display text-3xl font-semibold tracking-tight">{t('quran.tafseer')}</h1>

    {#if data.error}
      <p role="alert" class="mt-4">{tError(data.error)}</p>
    {:else}
      <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.surahs as s (s.surahNo)}
          <a
            href={`/quran/tafseer/${s.surahNo}`}
            class="flex items-center gap-3 rounded-lg border bg-background p-3 transition-shadow hover:shadow-sm"
          >
            <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
              {s.surahNo}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium" dir="rtl">{s.nameAr}</span>
              <span class="block truncate text-xs text-muted-foreground">{s.nameEn}</span>
            </span>
            {#if s.hasTafseer}
              <Badge variant="secondary">{t('quran.tafseer')}</Badge>
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </main>
</div>
