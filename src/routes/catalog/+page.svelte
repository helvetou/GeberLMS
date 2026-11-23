<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { LOCALES } from '$lib/domain/i18n';
  import type { PageProps } from './$types';

  const { t, tError } = useI18n();
  let { data }: PageProps = $props();

  function priceLabel(priceCents: number | undefined): string {
    if (!priceCents || priceCents <= 0) return t('catalog.free');
    return `€${(priceCents / 100).toFixed(2)}`;
  }
</script>

<svelte:head>
  <title>{t('nav.catalog')} — GeberLMS</title>
</svelte:head>

<div class="min-h-svh bg-muted/40">
  <header class="flex h-14 items-center justify-between border-b bg-background px-4">
    <a href="/" class="font-display text-lg font-semibold">{t('brand.name')}</a>
    <div class="flex items-center gap-2">
      <LangSwitch />
      <Button variant="ghost" href="/login">{t('login.title')}</Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-5xl p-4 md:p-6">
    <h1 class="text-2xl font-semibold">{t('nav.catalog')}</h1>

    {#if data.error}
      <p role="alert">{tError(data.error)}</p>
    {/if}

    <form method="GET" action="/catalog" class="mt-4 flex flex-wrap gap-3">
      <Input name="q" value={data.filters?.query ?? ''} placeholder={t('catalog.search')} class="min-w-40 flex-1" />
      <select name="category" class="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
        <option value="">{t('catalog.allCategories')}</option>
        {#each data.categories as c (c)}
          <option value={c} selected={data.filters?.category === c}>{c}</option>
        {/each}
      </select>
      <select name="level" class="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
        <option value="">{t('catalog.allLevels')}</option>
        {#each data.levels as l (l)}
          <option value={l} selected={data.filters?.level === l}>{l}</option>
        {/each}
      </select>
      <select name="language" class="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
        <option value="">{t('catalog.allLanguages')}</option>
        {#each LOCALES as code (code)}
          <option value={code} selected={data.filters?.language === code}>{t(`lang.${code}`)}</option>
        {/each}
      </select>
      <Button type="submit" variant="secondary">{t('catalog.search')}</Button>
    </form>

    {#if data.courses.length === 0}
      <p class="mt-8 text-muted-foreground">{t('catalog.noCourses')}</p>
    {:else}
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.courses as course (course.id)}
          <a href={`/catalog/${course.slug}`} class="group">
            <Card.Root class="h-full transition-shadow group-hover:shadow-md">
              <Card.Header>
                <Card.Title class="line-clamp-2">{course.title}</Card.Title>
                <Card.Description class="line-clamp-3">{course.description ?? ''}</Card.Description>
              </Card.Header>
              <Card.Content>
                <div class="flex flex-wrap items-center gap-2">
                  {#if course.category}<Badge variant="secondary">{course.category}</Badge>{/if}
                  {#if course.level}<Badge variant="outline">{course.level}</Badge>{/if}
                  <span class="ml-auto text-sm font-medium">{priceLabel(course.priceCents)}</span>
                </div>
              </Card.Content>
            </Card.Root>
          </a>
        {/each}
      </div>
    {/if}
  </main>
</div>
