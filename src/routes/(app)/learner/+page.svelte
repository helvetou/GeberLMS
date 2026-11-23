<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  const lessons = $derived(
    data.view
      ? data.view.courses.flatMap((c) =>
          c.lessons.map((l) => ({ lessonId: l.lessonId, title: l.title, courseTitle: c.title })),
        )
      : [],
  );
</script>

<svelte:head>
  <title>{t('learner.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('learner.title')}</h1>

{#if data.view}
  {#if data.view.courses.length === 0}
    <p>{t('learner.noCourses')}</p>
  {:else}
    <ul>
      {#each data.view.courses as c (c.courseId)}
        <li>
          <strong>{c.title}</strong>
          — {c.completedLessons}/{c.totalLessons} {t('common.lessons')} ({tStatus(c.status)})
          <ul>
            {#each c.lessons as l (l.lessonId)}
              <li>
                {l.title} — {tStatus(l.status)}
                {#if l.type === 'quiz'}
                  {#if (data.quizzes[l.lessonId] ?? []).length > 0}
                    <form method="POST" action="?/submitQuiz">
                      <input type="hidden" name="enrollmentId" value={c.enrollmentId} />
                      <input type="hidden" name="lessonId" value={l.lessonId} />
                      {#each data.quizzes[l.lessonId] as q (q.id)}
                        <p>{q.prompt}</p>
                        {#each q.choices as choice, i (i)}
                          <label>
                            <input type="radio" name={`q_${q.id}`} value={i} />
                            {choice}
                          </label>
                        {/each}
                      {/each}
                      <button type="submit">{t('learner.submitQuiz')}</button>
                    </form>
                  {:else}
                    <em>{t('learner.emptyQuiz')}</em>
                  {/if}
                {:else if l.status !== 'completed'}
                  <form method="POST" action="?/complete" style="display: inline">
                    <input type="hidden" name="enrollmentId" value={c.enrollmentId} />
                    <input type="hidden" name="lessonId" value={l.lessonId} />
                    <button type="submit">{t('learner.markDone')}</button>
                  </form>
                {/if}
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  {/if}

  <h2>{t('learner.myDocs')}</h2>
  <form method="POST" action="?/upload" enctype="multipart/form-data">
    <label>{t('learner.file')} <input type="file" name="file" required /></label>
    <label>
      {t('learner.lessonOptional')}
      <select name="lessonId">
        <option value="">{t('learner.none')}</option>
        {#each lessons as l (l.lessonId)}
          <option value={l.lessonId}>{l.courseTitle} — {l.title}</option>
        {/each}
      </select>
    </label>
    <button type="submit">{t('learner.upload')}</button>
  </form>

  {#if (data.uploads ?? []).length === 0}
    <p><em>{t('learner.noDocs')}</em></p>
  {:else}
    <ul>
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

{#if form?.ok && form.quizResult}
  <p role="status">
    {t('learner.quizResult', {
      correct: form.quizResult.correct,
      total: form.quizResult.total,
      percentage: form.quizResult.percentage,
    })}
  </p>
{:else if form?.ok && form.uploaded}
  <p role="status">{t('learner.uploaded')}</p>
{:else if form?.ok}
  <p role="status">{t('learner.progressSaved')}</p>
{/if}
