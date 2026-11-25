<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import CourseCard from '$lib/components/course-card.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import SearchIcon from '@lucide/svelte/icons/search';
  import BookOpenIcon from '@lucide/svelte/icons/book-open';
  import { LOCALES } from '$lib/domain/i18n';
  import type { PageProps } from './$types';

  const { t, tError } = useI18n();
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('nav.catalog')} — GeberLMS</title>
</svelte:head>

<div class="min-h-svh bg-muted/40">
  <header class="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
    <a href="/" class="font-display text-lg font-semibold">{t('brand.name')}</a>
    <div class="flex items-center gap-2">
      <LangSwitch />
      <Button variant="ghost" href="/login">{t('login.title')}</Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
    <div class="max-w-2xl">
      <h1 class="font-display text-3xl font-semibold tracking-tight md:text-4xl">{t('nav.catalog')}</h1>
      <p class="mt-2 text-muted-foreground md:text-lg">{t('catalog.subtitle')}</p>
    </div>

    {#if data.error}
      <p role="alert" class="mt-4">{tError(data.error)}</p>
    {/if}

    <form
      method="GET"
      action="/catalog"
      class="mt-6 flex flex-wrap items-end gap-3 rounded-xl border bg-background p-3"
    >
      <div class="relative min-w-48 flex-1">
        <SearchIcon class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" value={data.filters?.query ?? ''} placeholder={t('catalog.search')} class="pl-8" />
      </div>
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
      <Button type="submit">{t('catalog.search')}</Button>
    </form>

    {#if data.courses.length === 0}
      <div class="mt-10">
        <EmptyState icon={BookOpenIcon} title={t('catalog.emptyTitle')} description={t('catalog.noCourses')} />
      </div>
    {:else}
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.courses as course (course.id)}
          <CourseCard {course} />
        {/each}
      </div>
    {/if}
  </main>
</div>
