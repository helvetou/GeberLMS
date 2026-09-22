<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
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
                {#if l.status !== 'completed'}
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
{:else}
  <p role="alert">{data.error}</p>
{/if}

{#if form?.error}
  <p role="alert">{form.error}</p>
{/if}

{#if form?.ok}
  <p role="status">Progression enregistrée.</p>
{/if}
