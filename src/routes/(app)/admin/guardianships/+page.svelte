<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import PageHeader from '$lib/components/page-header.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import LinkIcon from '@lucide/svelte/icons/link';
  import UnlinkIcon from '@lucide/svelte/icons/unlink';
  import UsersRoundIcon from '@lucide/svelte/icons/users-round';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('guardianships.title')} — GeberLMS</title>
</svelte:head>

<PageHeader title={t('guardianships.title')} subtitle={t('guardianships.link')} />

{#if data.error}
  <p role="alert" class="mt-4">{tError(data.error)}</p>
{/if}
{#if form?.error}
  <p role="alert" class="mt-4">{tError(form.error)}</p>
{/if}

<Card.Root class="mt-6">
  <Card.Header>
    <Card.Title>{t('guardianships.link')}</Card.Title>
  </Card.Header>
  <Card.Content>
    <form method="POST" action="?/link" class="flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-2">
        <Label for="tutorId">{t('guardianships.tutor')}</Label>
        <select id="tutorId" name="tutorId" required class="h-9 min-w-48 rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="">{t('guardianships.tutor')}</option>
          {#each data.tutors as tutor (tutor.id)}
            <option value={tutor.id}>{tutor.name ?? tutor.email}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col gap-2">
        <Label for="learnerId">{t('guardianships.learner')}</Label>
        <select id="learnerId" name="learnerId" required class="h-9 min-w-48 rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="">{t('guardianships.learner')}</option>
          {#each data.learners as learner (learner.id)}
            <option value={learner.id}>{learner.name ?? learner.email}</option>
          {/each}
        </select>
      </div>
      <Button type="submit">
        <LinkIcon class="size-4" /> {t('guardianships.submit')}
      </Button>
    </form>
  </Card.Content>
</Card.Root>

<h2 class="mt-6 font-display text-lg font-semibold">{t('guardianships.existing')}</h2>
{#if data.guardianships.length === 0}
  <div class="mt-4">
    <EmptyState icon={UsersRoundIcon} title={t('guardianships.none')} />
  </div>
{:else}
  <ul class="mt-4 space-y-2">
    {#each data.guardianships as g (`${g.tutorId}:${g.learnerId}`)}
      <li class="flex flex-wrap items-center gap-3 rounded-lg border bg-background p-3">
        <div class="min-w-0 flex-1">
          <p class="font-medium">{g.tutorName} <span class="text-muted-foreground">↔</span> {g.learnerName}</p>
          <p class="truncate text-xs text-muted-foreground">{g.tutorEmail} → {g.learnerEmail}</p>
        </div>
        <form method="POST" action="?/unlink">
          <input type="hidden" name="tutorId" value={g.tutorId} />
          <input type="hidden" name="learnerId" value={g.learnerId} />
          <Button type="submit" variant="outline" size="sm">
            <UnlinkIcon class="size-4" /> {t('guardianships.unlink')}
          </Button>
        </form>
      </li>
    {/each}
  </ul>
{/if}
