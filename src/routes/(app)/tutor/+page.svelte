<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();

  const totals = $derived.by(() => {
    const learners = data.view?.learners ?? [];
    let courses = 0;
    let completed = 0;
    let lessons = 0;
    for (const l of learners) {
      courses += l.courses.length;
      completed += l.courses.reduce((s, c) => s + c.completedLessons, 0);
      lessons += l.courses.reduce((s, c) => s + c.totalLessons, 0);
    }
    return { learners: learners.length, courses, completed, lessons };
  });

  function pct(done: number, total: number): number {
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }
</script>

<svelte:head>
  <title>{t('tutor.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('tutor.title')}</h1>

{#if data.view}
  <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card.Root><Card.Content class="py-4"><p class="text-sm text-muted-foreground">{t('users.learner')}</p><p class="text-2xl font-semibold">{totals.learners}</p></Card.Content></Card.Root>
    <Card.Root><Card.Content class="py-4"><p class="text-sm text-muted-foreground">{t('common.lessons')}</p><p class="text-2xl font-semibold">{totals.courses}</p></Card.Content></Card.Root>
    <Card.Root><Card.Content class="py-4"><p class="text-sm text-muted-foreground">{t('dashboard.completed')}</p><p class="text-2xl font-semibold">{totals.completed}</p></Card.Content></Card.Root>
    <Card.Root><Card.Content class="py-4"><p class="text-sm text-muted-foreground">{t('dashboard.inProgress')}</p><p class="text-2xl font-semibold">{totals.lessons - totals.completed}</p></Card.Content></Card.Root>
  </div>

  {#if data.view.learners.length === 0}
    <p class="mt-4 text-muted-foreground">{t('tutor.noLearners')}</p>
  {:else}
    <ul class="mt-6 space-y-4">
      {#each data.view.learners as learner (learner.learnerId)}
        <li class="rounded-lg border bg-background p-4">
          <h2 class="font-medium">{learner.name}</h2>
          {#if learner.courses.length === 0}
            <p class="text-sm text-muted-foreground">{t('learner.noCourses')}</p>
          {:else}
            <ul class="mt-2 space-y-2">
              {#each learner.courses as c (c.courseId)}
                <li>
                  <div class="flex items-center justify-between gap-2">
                    <span>{c.title}</span>
                    <Badge variant="outline">{tStatus(c.status)}</Badge>
                  </div>
                  <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div class="h-full rounded-full bg-primary" style={`width: ${pct(c.completedLessons, c.totalLessons)}%`}></div>
                  </div>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    {c.completedLessons}/{c.totalLessons} {t('common.lessons')}
                  </p>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  <p role="alert">{tError(data.error)}</p>
{/if}
