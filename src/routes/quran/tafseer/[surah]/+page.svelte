<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import BookOpenIcon from '@lucide/svelte/icons/book-open';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.surah ? `${data.surah.nameAr} — ${t('quran.tafseer')}` : t('quran.tafseer')} — GeberLMS</title>
</svelte:head>

<div class="min-h-svh bg-muted/40">
  <header class="flex h-14 items-center justify-between border-b bg-background px-4">
    <a href="/quran/tafseer" class="font-display text-lg font-semibold">{t('quran.title')}</a>
    <div class="flex items-center gap-2">
      <LangSwitch />
      <Button variant="ghost" href="/login">{t('login.title')}</Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-3xl px-4 py-8">
    {#if data.error}
      <p role="alert">{tError(data.error)}</p>
    {:else if !data.surah}
      <p role="alert">{tError('errors.surah_not_found')}</p>
    {:else}
      {@const s = data.surah}
      <a href="/quran/tafseer" class="text-sm text-muted-foreground hover:text-foreground">← {t('quran.back')}</a>
      <div class="mt-2 flex flex-wrap items-center gap-3">
        <h1 class="font-display text-3xl font-semibold" dir="rtl">{s.nameAr}</h1>
        <span class="text-lg text-muted-foreground">{s.surahNo} · {s.nameEn}</span>
      </div>

      <!-- Pages du Mushaf contenant la sourate -->
      <Card.Root class="mt-4">
        <Card.Header>
          <Card.Title>{t('quran.pagesLabel')}</Card.Title>
          <Card.Description>
            {t('quran.pages')} {s.startPage}–{s.endPage}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <Button href={`/quran/#p=${s.startPage}`}>
            <BookOpenIcon class="size-4" /> {t('quran.openMushaf')}
          </Button>
          <div class="mt-3 flex flex-wrap gap-1">
            {#each data.pages as p (p)}
              <a
                href={`/quran/#p=${p}`}
                class="inline-flex size-8 items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-muted"
                title={t('quran.page', { n: p })}
              >
                {p}
              </a>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Tafseer -->
      <h2 class="mt-6 font-display text-xl font-semibold">{t('quran.tafseer')}</h2>
      {#if data.tafseerHtmlRaw}
        <iframe
          title={t('quran.tafseer')}
          srcdoc={data.tafseerHtmlRaw}
          class="mt-3 h-[75vh] w-full rounded-lg border bg-background"
        ></iframe>
      {:else if data.tafseerHtml}
        <div class="prose prose-sm mt-3 max-w-none rounded-lg border bg-background p-4">{@html data.tafseerHtml}</div>
      {:else}
        <p class="mt-2 text-muted-foreground">{t('quran.noTafseer')}</p>
      {/if}
    {/if}
  </main>
</div>
