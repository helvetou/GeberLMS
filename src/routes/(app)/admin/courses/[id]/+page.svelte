<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Accordion from '$lib/components/ui/accordion/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import PlayIcon from '@lucide/svelte/icons/play';
  import ListChecksIcon from '@lucide/svelte/icons/list-checks';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import type { PageProps } from './$types';

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
  <title>{data.detail?.course.title ?? t('courses.title')} — GeberLMS</title>
</svelte:head>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{:else if !data.detail}
  <p role="alert">{t('catalog.notFound')}</p>
{:else}
  {@const course = data.detail.course}
  <a href="/admin/courses" class="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
    <ArrowLeftIcon class="size-4" /> {t('catalog.back')}
  </a>

  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="font-display text-2xl font-semibold tracking-tight md:text-3xl">{course.title}</h1>
      {#if course.description}
        <p class="mt-1 text-muted-foreground">{course.description}</p>
      {/if}
    </div>
    <Button href={`/admin/courses/${course.id}/edit`}>
      <PencilIcon class="size-4" /> {t('courses.modify')}
    </Button>
  </div>

  <div class="mt-4 flex flex-wrap items-center gap-2">
    <Badge variant="outline">{t(`lang.${course.language}`)}</Badge>
    {#if course.category}<Badge variant="secondary">{course.category}</Badge>{/if}
    {#if course.level}<Badge variant="outline">{course.level}</Badge>{/if}
    {#if course.visibility === 'hidden'}<Badge variant="destructive"><EyeOffIcon class="size-3" /> {t('common.hidden')}</Badge>{/if}
    {#if course.isPublic}<Badge variant="secondary">{t('courses.public')}</Badge>{/if}
    <span class="ml-auto text-lg font-semibold">{priceLabel(course.priceCents)}</span>
  </div>

  <h2 class="mt-8 font-display text-xl font-semibold">{t('catalog.syllabus')}</h2>
  {#if data.detail.modules.length === 0}
    <p class="mt-2 text-muted-foreground">{t('catalog.noModules')}</p>
  {:else}
    <Accordion.Root type="multiple" class="mt-4">
      {#each data.detail.modules as m (m.module.id)}
        <Accordion.Item value={m.module.id} class="rounded-lg border bg-background">
          <Accordion.Trigger class="px-4 font-medium">
            {m.module.title}
            {#if m.module.visibility === 'hidden'}
              <Badge variant="destructive" class="ml-2"><EyeOffIcon class="size-3" /> {t('common.hidden')}</Badge>
            {/if}
            <span class="ml-2 text-xs text-muted-foreground">{m.lessons.length}</span>
          </Accordion.Trigger>
          <Accordion.Content class="px-4 pb-3">
            {#if m.lessons.length === 0}
              <p class="text-sm text-muted-foreground">{t('reader.noContent')}</p>
            {:else}
              <ul class="space-y-3">
                {#each m.lessons as row (row.lesson.id)}
                  {@const lesson = row.lesson}
                  {@const Icon = lessonIcon(lesson.type)}
                  <li>
                    <div class="flex items-center gap-2">
                      <div class="rounded-md bg-muted p-1.5 text-muted-foreground"><Icon class="size-4" /></div>
                      <span class="font-medium">{lesson.title}</span>
                      {#if lesson.visibility === 'hidden'}
                        <Badge variant="destructive"><EyeOffIcon class="size-3" /> {t('common.hidden')}</Badge>
                      {/if}
                      <span class="ml-auto text-xs uppercase text-muted-foreground">{lesson.type}</span>
                    </div>
                    {#if row.resources.length > 0}
                      <ul class="mt-2 space-y-1 pl-8 text-sm text-muted-foreground">
                        {#each row.resources as r (r.id)}
                          <li>
                            {r.title}
                            {#if r.visibility === 'hidden'} — {t('common.hidden')}{/if}
                          </li>
                        {/each}
                      </ul>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  {/if}
{/if}
