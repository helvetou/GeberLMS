<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Accordion from '$lib/components/ui/accordion/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import PlayIcon from '@lucide/svelte/icons/play';
  import ListChecksIcon from '@lucide/svelte/icons/list-checks';
  import type { PageProps } from './$types';

  const { t, tError } = useI18n();
  let { data }: PageProps = $props();

  function priceLabel(priceCents: number | undefined): string {
    if (!priceCents || priceCents <= 0) return t('catalog.free');
    return `€${(priceCents / 100).toFixed(2)}`;
  }

  function lessonIcon(type: string) {
    return type === 'video' ? PlayIcon : type === 'quiz' ? ListChecksIcon : FileTextIcon;
  }
</script>

<svelte:head>
  <title>{data.detail?.course.title ?? t('nav.catalog')} — GeberLMS</title>
</svelte:head>

<div class="min-h-svh bg-muted/40">
  <header class="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
    <a href="/catalog" class="font-display text-lg font-semibold">{t('brand.name')}</a>
    <div class="flex items-center gap-2">
      <LangSwitch />
      <Button variant="ghost" href="/login">{t('login.title')}</Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
    {#if data.error}
      <p role="alert">{tError(data.error)}</p>
    {:else if !data.detail}
      <p role="alert">{t('catalog.notFound')}</p>
    {:else}
      {@const course = data.detail.course}
      <Button variant="ghost" href="/catalog" class="mb-4 -ml-2">
        <ArrowLeftIcon class="size-4" /> {t('catalog.back')}
      </Button>

      <Card.Root class="overflow-hidden">
        <div class="h-32 bg-gradient-to-br from-indigo-500 to-violet-600 md:h-40"></div>
        <Card.Header>
          <div class="flex flex-wrap items-center gap-2">
            {#if course.category}<Badge variant="secondary">{course.category}</Badge>{/if}
            {#if course.level}<Badge variant="outline">{course.level}</Badge>{/if}
            <Badge variant="outline">{t(`lang.${course.language}`)}</Badge>
          </div>
          <Card.Title class="mt-2 font-display text-2xl md:text-3xl">{course.title}</Card.Title>
          <Card.Description class="text-base">{course.description ?? ''}</Card.Description>
        </Card.Header>
        <Card.Footer class="justify-between">
          <span class="text-xl font-semibold">{priceLabel(course.priceCents)}</span>
          <Button href="/login">{t('login.title')}</Button>
        </Card.Footer>
      </Card.Root>

      <h2 class="mt-8 font-display text-xl font-semibold">{t('catalog.syllabus')}</h2>
      {#if data.detail.syllabus.length === 0}
        <p class="mt-2 text-muted-foreground">{t('catalog.noModules')}</p>
      {:else}
        <Accordion.Root type="multiple" class="mt-4">
          {#each data.detail.syllabus as s (s.module.id)}
            <Accordion.Item value={s.module.id} class="rounded-lg border bg-background">
              <Accordion.Trigger class="px-4 font-medium">
                {s.module.title}
                <span class="ml-2 text-xs text-muted-foreground">{s.lessons.length}</span>
              </Accordion.Trigger>
              <Accordion.Content class="px-4 pb-3">
                <ul class="space-y-2">
                  {#each s.lessons as lesson (lesson.id)}
                    {@const Icon = lessonIcon(lesson.type)}
                    <li class="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon class="size-4" />
                      <span>{lesson.title}</span>
                      <span class="ml-auto text-xs uppercase">{lesson.type}</span>
                    </li>
                  {/each}
                </ul>
              </Accordion.Content>
            </Accordion.Item>
          {/each}
        </Accordion.Root>
      {/if}
    {/if}
  </main>
</div>
