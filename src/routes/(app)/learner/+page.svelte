<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import PageHeader from '$lib/components/page-header.svelte';
  import StatCard from '$lib/components/stat-card.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import BookOpenIcon from '@lucide/svelte/icons/book-open';
  import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
  import ClockIcon from '@lucide/svelte/icons/clock';
  import GaugeIcon from '@lucide/svelte/icons/gauge';
  import UploadIcon from '@lucide/svelte/icons/upload';
  import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
  import LogInIcon from '@lucide/svelte/icons/log-in';
  import LogOutIcon from '@lucide/svelte/icons/log-out';
  import UserPlusIcon from '@lucide/svelte/icons/user-plus';
  import ActivityIcon from '@lucide/svelte/icons/activity';
  import type { Component } from 'svelte';
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

  const nextCourse = $derived.by(() => {
    const next = data.next;
    if (!next) return undefined;
    return data.view?.courses.find((c) => c.courseId === next.courseId);
  });

  const ringPct = $derived(nextCourse ? pct(nextCourse.completedLessons, nextCourse.totalLessons) : 0);
  const CIRCUMFERENCE = 2 * Math.PI * 18;

  const ACTION_ICONS: Record<string, Component> = {
    'auth.login': LogInIcon,
    'auth.logout': LogOutIcon,
    'progress.update': CheckCircleIcon,
    'upload.create': UploadIcon,
    'enrollment.create': UserPlusIcon,
  };
</script>

<svelte:head>
  <title>{t('learner.title')} — GeberLMS</title>
</svelte:head>

{#if data.view}
  {@const stats = data.stats}

  <PageHeader title={t('dashboard.welcome', { name: data.userName })} subtitle={t('learner.title')} />

  <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard icon={BookOpenIcon} label={t('learner.title')} value={stats.totalCourses} tone="primary" />
    <StatCard icon={CheckCircleIcon} label={t('dashboard.completed')} value={stats.completedLessons} tone="success" />
    <StatCard icon={ClockIcon} label={t('dashboard.inProgress')} value={stats.inProgressLessons} tone="warning" />
    <StatCard icon={GaugeIcon} label={t('dashboard.avgScore')} value={`${stats.averageScore} %`} />
  </div>

  {#if data.next}
    <Card.Root class="mt-4">
      <Card.Content class="flex items-center gap-4 py-4">
        <div class="relative flex size-14 items-center justify-center">
          <svg viewBox="0 0 40 40" class="size-14 -rotate-90">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" class="text-muted" stroke-width="3" />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              class="text-primary"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray={`${(CIRCUMFERENCE * ringPct) / 100} ${CIRCUMFERENCE}`}
            />
          </svg>
          <span class="absolute text-xs font-semibold">{ringPct}%</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-muted-foreground">{data.next.courseTitle}</p>
          <p class="truncate font-medium">{data.next.lessonTitle}</p>
        </div>
        <a
          href={`/learner/courses/${data.next.courseId}`}
          class="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          {t('dashboard.continue')} <ArrowRightIcon class="size-4" />
        </a>
      </Card.Content>
    </Card.Root>
  {/if}

  <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
    <section>
      <h2 class="font-display text-lg font-semibold">{t('learner.title')}</h2>
      {#if data.view.courses.length === 0}
        <p class="mt-2 text-muted-foreground">{t('learner.noCourses')}</p>
      {:else}
        <ul class="mt-3 space-y-3">
          {#each data.view.courses as c (c.courseId)}
            <li class="rounded-lg border bg-background p-4 transition-shadow hover:shadow-sm">
              <div class="flex items-center justify-between gap-2">
                <a href={`/learner/courses/${c.courseId}`} class="font-medium hover:underline">
                  {c.title}
                </a>
                <Badge variant="outline">{tStatus(c.status)}</Badge>
              </div>
              <Progress value={pct(c.completedLessons, c.totalLessons)} class="mt-3" />
              <p class="mt-2 text-xs text-muted-foreground">
                {c.completedLessons}/{c.totalLessons} {t('common.lessons')}
                ({pct(c.completedLessons, c.totalLessons)} %)
              </p>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section>
      <h2 class="font-display text-lg font-semibold">{t('dashboard.activity')}</h2>
      {#if (data.activity ?? []).length === 0}
        <p class="mt-2 text-muted-foreground">{t('dashboard.noActivity')}</p>
      {:else}
        <ul class="mt-3 space-y-2">
          {#each data.activity as a (a.id)}
            {@const Icon = ACTION_ICONS[a.action] ?? ActivityIcon}
            <li class="flex items-start gap-3 rounded-md border bg-background px-3 py-2">
              <div class="rounded-md bg-muted p-1.5 text-muted-foreground"><Icon class="size-4" /></div>
              <div class="min-w-0 flex-1">
                <span class="block truncate text-xs font-mono text-muted-foreground">{a.action}</span>
                <span class="block text-xs text-muted-foreground">{a.createdAt}</span>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>

  <Card.Root class="mt-6">
    <Card.Header>
      <Card.Title>{t('learner.myDocs')}</Card.Title>
    </Card.Header>
    <Card.Content>
      <form method="POST" action="?/upload" enctype="multipart/form-data" class="flex flex-wrap gap-3">
        <label class="flex items-center gap-2">
          <span class="text-sm">{t('learner.file')}</span>
          <input type="file" name="file" required class="text-sm" />
        </label>
        <label class="flex items-center gap-2">
          <span class="text-sm">{t('learner.lessonOptional')}</span>
          <select name="lessonId" class="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
            <option value="">{t('learner.none')}</option>
            {#each lessons as l (l.lessonId)}
              <option value={l.lessonId}>{l.courseTitle} — {l.title}</option>
            {/each}
          </select>
        </label>
        <button type="submit" class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm">
          <UploadIcon class="size-4" /> {t('learner.upload')}
        </button>
      </form>

      {#if (data.uploads ?? []).length === 0}
        <p class="mt-3 text-sm text-muted-foreground">{t('learner.noDocs')}</p>
      {:else}
        <ul class="mt-3 space-y-1 text-sm">
          {#each data.uploads as u (u.id)}
            <li>{u.filename ?? u.r2Key} — {u.createdAt}</li>
          {/each}
        </ul>
      {/if}
    </Card.Content>
  </Card.Root>
{:else}
  <p role="alert">{tError(data.error)}</p>
{/if}

{#if form?.error}
  <p role="alert">{tError(form.error)}</p>
{/if}
{#if form?.ok && form.uploaded}
  <p role="status">{t('learner.uploaded')}</p>
{/if}
