<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.reader?.course.title ?? t('learner.title')} — GeberLMS</title>
</svelte:head>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{:else if data.reader}
  {@const reader = data.reader}

  <!-- Filigrane anti-copie (m5, dissuasif) -->
  <div
    class="pointer-events-none fixed inset-0 z-50 select-none overflow-hidden opacity-[0.04]"
    aria-hidden="true"
  >
    <div class="rotate-[-24deg] text-2xl font-bold whitespace-nowrap">
      {data.learnerName} · {data.learnerEmail} · {data.learnerEmail}
    </div>
  </div>

  <h1>{reader.course.title}</h1>
  <p class="text-muted-foreground">
    {reader.completedLessons}/{reader.totalLessons} {t('common.lessons')}
    ({Math.round((reader.totalLessons ? reader.completedLessons / reader.totalLessons : 0) * 100)} %)
  </p>

  {#if form?.error}
    <p role="alert">{tError(form.error)}</p>
  {/if}
  {#if form?.ok && form.quizResult}
    <p role="status">
      {t('learner.quizResult', {
        correct: form.quizResult.correct,
        total: form.quizResult.total,
        percentage: form.quizResult.percentage,
      })}
    </p>
  {:else if form?.ok}
    <p role="status">{t('learner.progressSaved')}</p>
  {/if}

  <div class="mt-4 space-y-4 select-none">
    {#each reader.modules as m (m.module.id)}
      <details open class="rounded-lg border bg-background">
        <summary class="cursor-pointer px-4 py-3 font-medium">
          {m.module.title}
          <span class="ml-2 text-xs text-muted-foreground">
            {m.lessons.filter((l) => l.status === 'completed').length}/{m.lessons.length}
          </span>
        </summary>

        <div class="divide-y">
          {#each m.lessons as row (row.lesson.id)}
            {@const lesson = row.lesson}
            <div class="px-4 py-4">
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-medium">{lesson.title}</h3>
                <span class="text-xs text-muted-foreground">{tStatus(row.status)}</span>
              </div>

              {#if lesson.type === 'text'}
                {#if data.rendered[lesson.id]}
                  <!-- Contenu rédigé par l'admin (frontière de confiance) -->
                  <div class="prose prose-sm mt-2 max-w-none">{@html data.rendered[lesson.id]}</div>
                {:else}
                  <p class="text-muted-foreground">{t('reader.noContent')}</p>
                {/if}
              {:else if lesson.type === 'video'}
                {#if lesson.contentRef}
                  <video controls class="mt-2 w-full rounded-md" preload="metadata">
                    <source src={lesson.contentRef} />
                  </video>
                {:else}
                  <p class="text-muted-foreground">{t('reader.noContent')}</p>
                {/if}
              {:else if lesson.type === 'quiz'}
                {#if (data.quizzes[lesson.id] ?? []).length > 0}
                  <form method="POST" action="?/submitQuiz" class="mt-2 space-y-2">
                    <input type="hidden" name="enrollmentId" value={reader.enrollmentId} />
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    {#each data.quizzes[lesson.id] as q (q.id)}
                      <fieldset class="rounded-md border p-2">
                        <legend class="px-1 text-sm">{q.prompt}</legend>
                        {#each q.choices as choice, i (i)}
                          <label class="flex items-center gap-2 text-sm">
                            <input type="radio" name={`q_${q.id}`} value={i} />
                            {choice}
                          </label>
                        {/each}
                      </fieldset>
                    {/each}
                    <button type="submit" class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
                      {t('learner.submitQuiz')}
                    </button>
                  </form>
                {:else}
                  <em class="text-sm text-muted-foreground">{t('learner.emptyQuiz')}</em>
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
                  <button type="submit" class="rounded-md border px-3 py-1.5 text-sm">
                    {t('learner.markDone')}
                  </button>
                </form>
              {/if}
            </div>
          {/each}
        </div>
      </details>
    {/each}
  </div>
{/if}
