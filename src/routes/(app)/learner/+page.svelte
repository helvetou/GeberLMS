<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  const lessons = $derived(
    data.view
      ? data.view.courses.flatMap((c) =>
          c.lessons.map((l) => ({ lessonId: l.lessonId, title: l.title, courseTitle: c.title })),
        )
      : [],
  );

  function pct(done: number, total: number): number {
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }
</script>

<svelte:head>
  <title>{t('learner.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('learner.title')}</h1>

{#if data.view}
  {@const stats = data.stats}
  <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Content class="py-4">
        <p class="text-sm text-muted-foreground">{t('learner.title')}</p>
        <p class="text-2xl font-semibold">{stats.totalCourses}</p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="py-4">
        <p class="text-sm text-muted-foreground">{t('dashboard.completed')}</p>
        <p class="text-2xl font-semibold">{stats.completedLessons}</p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="py-4">
        <p class="text-sm text-muted-foreground">{t('dashboard.inProgress')}</p>
        <p class="text-2xl font-semibold">{stats.inProgressLessons}</p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="py-4">
        <p class="text-sm text-muted-foreground">{t('dashboard.avgScore')}</p>
        <p class="text-2xl font-semibold">{stats.averageScore} %</p>
      </Card.Content>
    </Card.Root>
  </div>

  {#if data.next}
    <Card.Root class="mt-4">
      <Card.Content class="flex items-center justify-between gap-4 py-4">
        <div>
          <p class="text-sm text-muted-foreground">{data.next.courseTitle}</p>
          <p class="font-medium">{data.next.lessonTitle}</p>
        </div>
        <a
          href={`/learner/courses/${data.next.courseId}`}
          class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          {t('dashboard.continue')}
        </a>
      </Card.Content>
    </Card.Root>
  {/if}

  <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
    <section>
      <h2 class="text-lg font-semibold">{t('learner.title')}</h2>
      {#if data.view.courses.length === 0}
        <p class="mt-2 text-muted-foreground">{t('learner.noCourses')}</p>
      {:else}
        <ul class="mt-3 space-y-3">
          {#each data.view.courses as c (c.courseId)}
            <li class="rounded-lg border bg-background p-4">
              <div class="flex items-center justify-between gap-2">
                <a href={`/learner/courses/${c.courseId}`} class="font-medium hover:underline">
                  {c.title}
                </a>
                <Badge variant="outline">{tStatus(c.status)}</Badge>
              </div>
              <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full rounded-full bg-primary"
                  style={`width: ${pct(c.completedLessons, c.totalLessons)}%`}
                ></div>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">
                {c.completedLessons}/{c.totalLessons} {t('common.lessons')}
                ({pct(c.completedLessons, c.totalLessons)} %)
              </p>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section>
      <h2 class="text-lg font-semibold">{t('dashboard.activity')}</h2>
      {#if (data.activity ?? []).length === 0}
        <p class="mt-2 text-muted-foreground">{t('dashboard.noActivity')}</p>
      {:else}
        <ul class="mt-3 space-y-2 text-sm">
          {#each data.activity as a (a.id)}
            <li class="rounded-md border bg-background px-3 py-2">
              <span class="font-mono text-xs text-muted-foreground">{a.action}</span>
              <span class="block text-xs text-muted-foreground">{a.createdAt}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>

  <h2 class="mt-6 text-lg font-semibold">{t('learner.myDocs')}</h2>
  <form method="POST" action="?/upload" enctype="multipart/form-data" class="mt-2 flex flex-wrap gap-3">
    <label class="flex items-center gap-2">
      <span>{t('learner.file')}</span>
      <input type="file" name="file" required class="text-sm" />
    </label>
    <label class="flex items-center gap-2">
      <span>{t('learner.lessonOptional')}</span>
      <select name="lessonId" class="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
        <option value="">{t('learner.none')}</option>
        {#each lessons as l (l.lessonId)}
          <option value={l.lessonId}>{l.courseTitle} — {l.title}</option>
        {/each}
      </select>
    </label>
    <button type="submit" class="rounded-md border px-3 py-1.5 text-sm">{t('learner.upload')}</button>
  </form>

  {#if (data.uploads ?? []).length === 0}
    <p class="mt-2 text-sm text-muted-foreground">{t('learner.noDocs')}</p>
  {:else}
    <ul class="mt-2 text-sm">
      {#each data.uploads as u (u.id)}
        <li>{u.filename ?? u.r2Key} — {u.createdAt}</li>
      {/each}
    </ul>
  {/if}
{:else}
  <p role="alert">{tError(data.error)}</p>
{/if}

{#if form?.error}
  <p role="alert">{tError(form.error)}</p>
{/if}
{#if form?.ok && form.uploaded}
  <p role="status">{t('learner.uploaded')}</p>
{/if}
