<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import PageHeader from '$lib/components/page-header.svelte';
  import DataTable from '$lib/components/data-table.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();

  const columns = [
    { key: 'surahNo', header: t('quran.surah') },
    { key: 'nameAr', header: t('quran.title') },
    { key: 'nameEn', header: t('common.title') },
    { key: 'pages', header: t('quran.pages'), format: (r: any) => `${r.startPage}–${r.endPage}` },
    {
      key: 'hasTafseer',
      header: t('quran.tafseer'),
      format: (r: any) => (r.hasTafseer ? t('common.show') : '—'),
    },
  ];
</script>

<svelte:head>
  <title>{t('quran.title')} — GeberLMS</title>
</svelte:head>

<PageHeader title={t('quran.title')} subtitle={t('quran.tafseer')} />

{#if data.error}
  <p role="alert" class="mt-4">{tError(data.error)}</p>
{/if}

<div class="mt-6">
  <DataTable
    data={data.surahs}
    {columns}
    rowKey="surahNo"
    searchable
    searchKeys={['nameAr', 'nameEn']}
    searchPlaceholder={t('catalog.search')}
  >
    {#snippet actions(row)}
      <Button href={`/admin/quran/${row.surahNo}`} size="sm" variant="outline">
        {t('quran.edit')}
      </Button>
    {/snippet}
  </DataTable>
</div>
