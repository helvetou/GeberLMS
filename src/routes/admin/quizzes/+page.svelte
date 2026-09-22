<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Quiz — GeberLMS</title>
</svelte:head>

<h1>Questions de quiz</h1>

{#if data.error}
  <p role="alert">{data.error}</p>
{/if}

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if data.lessons.length === 0}
  <p>Aucune leçon de type quiz.</p>
{:else}
  {#each data.lessons as lesson (lesson.lessonId)}
    <h2>{lesson.title} <small>({lesson.courseTitle} — {lesson.moduleTitle})</small></h2>

    <details>
      <summary>Ajouter une question</summary>
      <form method="POST" action="?/createQuestion">
        <input type="hidden" name="lessonId" value={lesson.lessonId} />
        <label>Énoncé <input type="text" name="prompt" required /></label><br />
        <label>Choix (un par ligne)
          <textarea name="choices" rows="3" required></textarea>
        </label><br />
        <label>Index bonne réponse (0 = premier) <input type="number" name="correctIndex" min="0" value="0" required /></label>
        <label>Points <input type="number" name="points" min="1" value="1" /></label>
        <button type="submit">Ajouter</button>
      </form>
    </details>

    {#if lesson.questions.length === 0}
      <p><em>Aucune question.</em></p>
    {:else}
      <ol>
        {#each lesson.questions as q (q.id)}
          <li>
            {q.prompt} — <strong>réponse {q.correctIndex}</strong>
            <ul>
              {#each q.choices as choice, i (i)}
                <li>{i === q.correctIndex ? '✓' : '·'} {choice}</li>
              {/each}
            </ul>
            <form method="POST" action="?/deleteQuestion" style="display: inline">
              <input type="hidden" name="id" value={q.id} />
              <button type="submit">Supprimer</button>
            </form>
          </li>
        {/each}
      </ol>
    {/if}
  {/each}
{/if}
