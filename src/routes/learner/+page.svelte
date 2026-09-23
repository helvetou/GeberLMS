<script lang="ts">
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
  <title>Mes cours — GeberLMS</title>
</svelte:head>

<h1>Mes cours</h1>

{#if data.view}
  {#if data.view.courses.length === 0}
    <p>Aucun cours inscrit.</p>
  {:else}
    <ul>
      {#each data.view.courses as c (c.courseId)}
        <li>
          <strong>{c.title}</strong>
          — {c.completedLessons}/{c.totalLessons} leçons ({c.status})
          <ul>
            {#each c.lessons as l (l.lessonId)}
              <li>
                {l.title} — {l.status}
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
                      <button type="submit">Valider le quiz</button>
                    </form>
                  {:else}
                    <em>Quiz sans question.</em>
                  {/if}
                {:else if l.status !== 'completed'}
                  <form method="POST" action="?/complete" style="display: inline">
                    <input type="hidden" name="enrollmentId" value={c.enrollmentId} />
                    <input type="hidden" name="lessonId" value={l.lessonId} />
                    <button type="submit">Marquer terminée</button>
                  </form>
                {/if}
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  {/if}

  <h2>Mes documents</h2>
  <form method="POST" action="?/upload" enctype="multipart/form-data">
    <label>Fichier <input type="file" name="file" required /></label>
    <label>
      Leçon (optionnel)
      <select name="lessonId">
        <option value="">— aucune —</option>
        {#each lessons as l (l.lessonId)}
          <option value={l.lessonId}>{l.courseTitle} — {l.title}</option>
        {/each}
      </select>
    </label>
    <button type="submit">Déposer</button>
  </form>

  {#if (data.uploads ?? []).length === 0}
    <p><em>Aucun document déposé.</em></p>
  {:else}
    <ul>
      {#each data.uploads as u (u.id)}
        <li>{u.filename ?? u.r2Key} — {u.createdAt}</li>
      {/each}
    </ul>
  {/if}
{:else}
  <p role="alert">{data.error}</p>
{/if}

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if form?.ok && form.quizResult}
  <p role="status">
    Quiz corrigé : {form.quizResult.correct}/{form.quizResult.total} bonnes réponses
    — {form.quizResult.percentage} %.
  </p>
{:else if form?.ok && form.uploaded}
  <p role="status">Document déposé.</p>
{:else if form?.ok}
  <p role="status">Progression enregistrée.</p>
{/if}
