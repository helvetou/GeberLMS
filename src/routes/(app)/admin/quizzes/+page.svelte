<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('quizzes.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('quizzes.title')}</h1>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{/if}

{#if form?.error}
  <p role="alert">{tError(form.error)}</p>
{/if}

{#if form?.ok && form.created !== undefined}
  <p role="status">{t('quizzes.generated', { count: form.created })}</p>
{/if}

{#if data.lessons.length === 0}
  <p>{t('quizzes.noLessons')}</p>
{:else}
  {#each data.lessons as lesson (lesson.lessonId)}
    <h2>{lesson.title} <small>({lesson.courseTitle} — {lesson.moduleTitle})</small></h2>

    <form method="POST" action="?/generate">
      <input type="hidden" name="lessonId" value={lesson.lessonId} />
      <label>{t('quizzes.topic')} <input type="text" name="topic" required /></label>
      <label>{t('quizzes.count')} <input type="number" name="count" min="1" max="20" value="5" style="width: 4em" /></label>
      <button type="submit">{t('quizzes.generate')}</button>
    </form>

    <details open>
      <summary>{t('quizzes.addQuestion')}</summary>
      <form method="POST" action="?/createQuestion">
        <input type="hidden" name="lessonId" value={lesson.lessonId} />
        <label>{t('quizzes.prompt')} <input type="text" name="prompt" required /></label><br />
        <label>{t('quizzes.choices')}
          <textarea name="choices" rows="3" required></textarea>
        </label><br />
        <label>{t('quizzes.correctIndex')} <input type="number" name="correctIndex" min="0" value="0" required /></label>
        <label>{t('quizzes.points')} <input type="number" name="points" min="1" value="1" /></label>
        <button type="submit">{t('quizzes.add')}</button>
      </form>
    </details>

    {#if lesson.questions.length === 0}
      <p><em>{t('quizzes.none')}</em></p>
    {:else}
      <ol>
        {#each lesson.questions as q (q.id)}
          <li>
            {q.prompt} — <strong>{t('quizzes.answer', { index: q.correctIndex })}</strong>
            <ul>
              {#each q.choices as choice, i (i)}
                <li>{i === q.correctIndex ? '✓' : '·'} {choice}</li>
              {/each}
            </ul>
            <form method="POST" action="?/deleteQuestion" style="display: inline">
              <input type="hidden" name="id" value={q.id} />
              <button type="submit">{t('common.delete')}</button>
            </form>
          </li>
        {/each}
      </ol>
    {/if}
  {/each}
{/if}
