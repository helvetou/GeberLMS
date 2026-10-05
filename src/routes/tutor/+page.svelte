<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus } = useI18n();
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('tutor.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('tutor.title')}</h1>

{#if data.view}
  {#if data.view.learners.length === 0}
    <p>{t('tutor.noLearners')}</p>
  {:else}
    <ul>
      {#each data.view.learners as learner (learner.learnerId)}
        <li>
          <strong>{learner.name}</strong>
          <ul>
            {#each learner.courses as c (c.courseId)}
              <li>
                {c.title} — {c.completedLessons}/{c.totalLessons} {t('common.lessons')}
                ({tStatus(c.status)})
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
