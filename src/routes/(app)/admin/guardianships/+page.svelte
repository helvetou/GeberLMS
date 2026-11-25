<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import { toast } from 'svelte-sonner';
  import PageHeader from '$lib/components/page-header.svelte';
  import DataTable from '$lib/components/data-table.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import LinkIcon from '@lucide/svelte/icons/link';
  import UnlinkIcon from '@lucide/svelte/icons/unlink';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  const columns = [
    { key: 'tutorName', header: t('guardianships.tutor') },
    { key: 'learnerName', header: t('guardianships.learner') },
    {
      key: 'tutorEmail',
      header: t('common.email'),
      format: (r: any) => `${r.tutorEmail} → ${r.learnerEmail}`,
    },
  ];

  $effect(() => {
    if (form?.error) toast.error(tError(form.error));
  });
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
<div class="mt-3">
  <DataTable
    data={data.guardianships}
    {columns}
    rowKey="id"
    empty={t('guardianships.none')}
    searchable
    searchKeys={['tutorName', 'learnerName', 'tutorEmail', 'learnerEmail']}
    searchPlaceholder={t('catalog.search')}
  >
    {#snippet actions(row)}
      <form method="POST" action="?/unlink">
        <input type="hidden" name="tutorId" value={row.tutorId} />
        <input type="hidden" name="learnerId" value={row.learnerId} />
        <Button type="submit" variant="outline" size="sm">
          <UnlinkIcon class="size-4" /> {t('guardianships.unlink')}
        </Button>
      </form>
    {/snippet}
  </DataTable>
</div>
