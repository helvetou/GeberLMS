<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import { toast } from 'svelte-sonner';
  import * as Accordion from '$lib/components/ui/accordion/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import PlayIcon from '@lucide/svelte/icons/play';
  import ListChecksIcon from '@lucide/svelte/icons/list-checks';
  import CheckIcon from '@lucide/svelte/icons/check';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  const pct = $derived(
    data.reader && data.reader.totalLessons > 0
      ? Math.round((data.reader.completedLessons / data.reader.totalLessons) * 100)
      : 0,
  );

  function lessonIcon(type: string) {
    return type === 'video' ? PlayIcon : type === 'quiz' ? ListChecksIcon : FileTextIcon;
  }

  $effect(() => {
    if (form?.error) toast.error(tError(form.error));
  });
  $effect(() => {
    if (form?.ok && form.quizResult) {
      toast.success(
        t('learner.quizResult', {
          correct: form.quizResult.correct,
          total: form.quizResult.total,
          percentage: form.quizResult.percentage,
        }),
      );
    } else if (form?.ok) {
      toast.success(t('learner.progressSaved'));
    }
  });
</script>

<svelte:head>
  <title>{data.reader?.course.title ?? t('learner.title')} — GeberLMS</title>
</svelte:head>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{:else if data.reader}
  {@const reader = data.reader}

  <!-- Filigrane anti-copie (dissuasif) -->
  <div
    class="pointer-events-none fixed inset-0 z-50 select-none overflow-hidden opacity-[0.04]"
    aria-hidden="true"
  >
    <div class="rotate-[-24deg] text-2xl font-bold whitespace-nowrap">
      {data.learnerName} · {data.learnerEmail} · {data.learnerEmail}
    </div>
  </div>

  <div class="mx-auto max-w-3xl">
    <a href="/learner" class="text-sm text-muted-foreground hover:text-foreground">← {t('learner.title')}</a>
    <h1 class="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">{reader.course.title}</h1>
    <div class="mt-3 flex items-center gap-3">
      <Progress value={pct} class="flex-1" />
      <span class="shrink-0 text-sm text-muted-foreground">
        {reader.completedLessons}/{reader.totalLessons} {t('common.lessons')} · {pct}%
      </span>
    </div>

    <div class="mt-6 space-y-3 select-none">
      <Accordion.Root type="multiple">
        {#each reader.modules as m (m.module.id)}
          {@const done = m.lessons.filter((l) => l.status === 'completed').length}
          <Accordion.Item value={m.module.id} class="rounded-lg border bg-background">
            <Accordion.Trigger class="px-4 font-medium">
              {m.module.title}
              <span class="ml-2 text-xs text-muted-foreground">{done}/{m.lessons.length}</span>
            </Accordion.Trigger>
            <Accordion.Content class="px-4 pb-3">
              <div class="divide-y">
                {#each m.lessons as row (row.lesson.id)}
                  {@const lesson = row.lesson}
                  {@const Icon = lessonIcon(lesson.type)}
                  <div class="py-4">
                    <div class="flex items-center gap-2">
                      <div class="rounded-md bg-muted p-1.5 text-muted-foreground">
                        <Icon class="size-4" />
                      </div>
                      <h3 class="flex-1 font-medium">{lesson.title}</h3>
                      {#if row.status === 'completed'}
                        <Badge variant="secondary"><CheckIcon class="size-3" /> {tStatus(row.status)}</Badge>
                      {:else}
                        <span class="text-xs text-muted-foreground">{tStatus(row.status)}</span>
                      {/if}
                    </div>

                    {#if lesson.type === 'text'}
                      {#if data.rendered[lesson.id]}
                        <div class="prose prose-sm mt-3 max-w-none">{@html data.rendered[lesson.id]}</div>
                      {:else}
                        <p class="mt-2 text-muted-foreground">{t('reader.noContent')}</p>
                      {/if}
                    {:else if lesson.type === 'video'}
                      {#if lesson.contentRef}
                        <video controls class="mt-3 w-full rounded-md border" preload="metadata">
                          <source src={lesson.contentRef} />
                        </video>
                      {:else}
                        <p class="mt-2 text-muted-foreground">{t('reader.noContent')}</p>
                      {/if}
                    {:else if lesson.type === 'quiz'}
                      {#if (data.quizzes[lesson.id] ?? []).length > 0}
                        <form method="POST" action="?/submitQuiz" class="mt-3 space-y-3">
                          <input type="hidden" name="enrollmentId" value={reader.enrollmentId} />
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          {#each data.quizzes[lesson.id] as q (q.id)}
                            <fieldset class="rounded-md border p-3">
                              <legend class="px-1 text-sm font-medium">{q.prompt}</legend>
                              <div class="mt-1 space-y-1">
                                {#each q.choices as choice, i (i)}
                                  <label class="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
                                    <input type="radio" name={`q_${q.id}`} value={i} class="accent-primary" />
                                    {choice}
                                  </label>
                                {/each}
                              </div>
                            </fieldset>
                          {/each}
                          <Button type="submit">{t('learner.submitQuiz')}</Button>
                        </form>
                      {:else}
                        <em class="mt-2 text-sm text-muted-foreground">{t('learner.emptyQuiz')}</em>
                      {/if}
                    {/if}

                    {#if row.resources.length > 0}
                      <div class="mt-3">
                        <span class="text-xs font-medium text-muted-foreground">{t('reader.resources')}</span>
                        <ul class="mt-1 text-sm">
                          {#each row.resources as r (r.id)}
                            <li>{r.title}</li>
                          {/each}
                        </ul>
                      </div>
                    {/if}

                    {#if lesson.type !== 'quiz' && row.status !== 'completed'}
                      <form method="POST" action="?/complete" class="mt-3">
                        <input type="hidden" name="enrollmentId" value={reader.enrollmentId} />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <Button type="submit" variant="outline" size="sm">
                          <CheckIcon class="size-4" /> {t('learner.markDone')}
                        </Button>
                      </form>
                    {/if}
                  </div>
                {/each}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        {/each}
      </Accordion.Root>
    </div>
  </div>
{/if}
