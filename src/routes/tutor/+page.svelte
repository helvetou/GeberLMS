<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Tableau de bord tuteur — GeberLMS</title>
</svelte:head>

<h1>Tableau de bord tuteur</h1>

{#if data.view}
  {#if data.view.learners.length === 0}
    <p>Aucun apprenant financé.</p>
  {:else}
    <ul>
      {#each data.view.learners as learner (learner.learnerId)}
        <li>
          <strong>{learner.name}</strong>
          <ul>
            {#each learner.courses as c (c.courseId)}
              <li>
                {c.title} — {c.completedLessons}/{c.totalLessons} leçons
                ({c.status})
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
