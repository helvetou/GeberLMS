<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { PageProps } from './$types';

  const { t, tError } = useI18n();
  let { data }: PageProps = $props();

  function priceLabel(priceCents: number | undefined): string {
    if (!priceCents || priceCents <= 0) return t('catalog.free');
    return `€${(priceCents / 100).toFixed(2)}`;
  }
</script>

<svelte:head>
  <title>{data.detail?.course.title ?? t('nav.catalog')} — GeberLMS</title>
</svelte:head>

<div class="min-h-svh bg-muted/40">
  <header class="flex h-14 items-center justify-between border-b bg-background px-4">
    <a href="/catalog" class="font-display text-lg font-semibold">{t('brand.name')}</a>
    <div class="flex items-center gap-2">
      <LangSwitch />
      <Button variant="ghost" href="/login">{t('login.title')}</Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-3xl p-4 md:p-6">
    {#if data.error}
      <p role="alert">{tError(data.error)}</p>
    {:else if !data.detail}
      <p role="alert">{t('catalog.notFound')}</p>
    {:else}
      {@const course = data.detail.course}
      <Button variant="ghost" href="/catalog" class="mb-4">← {t('catalog.back')}</Button>

      <Card.Root>
        <Card.Header>
          <Card.Title class="text-2xl">{course.title}</Card.Title>
          <Card.Description>{course.description ?? ''}</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-wrap items-center gap-2">
          {#if course.category}<Badge variant="secondary">{course.category}</Badge>{/if}
          {#if course.level}<Badge variant="outline">{course.level}</Badge>{/if}
          <Badge variant="outline">{t(`lang.${course.language}`)}</Badge>
          <span class="ml-auto text-lg font-semibold">{priceLabel(course.priceCents)}</span>
        </Card.Content>
      </Card.Root>

      <h2 class="mt-6 text-lg font-semibold">{t('catalog.syllabus')}</h2>
      {#if data.detail.syllabus.length === 0}
        <p class="text-muted-foreground">{t('catalog.noModules')}</p>
      {:else}
        {#each data.detail.syllabus as s (s.module.id)}
          <section class="mt-4 rounded-lg border bg-background p-4">
            <h3 class="font-medium">{s.module.title}</h3>
            <ul class="mt-2 space-y-1">
              {#each s.lessons as lesson (lesson.id)}
                <li class="flex items-center gap-2 text-sm text-muted-foreground">
                  <span class="text-xs">{lesson.type}</span>
                  <span>{lesson.title}</span>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      {/if}
    {/if}
  </main>
</div>
