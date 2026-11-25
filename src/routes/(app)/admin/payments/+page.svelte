<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tStatus, tError } = useI18n();
  import { toast } from 'svelte-sonner';
  import PageHeader from '$lib/components/page-header.svelte';
  import DataTable from '$lib/components/data-table.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  const enrollmentColumns = [
    { key: 'learnerName', header: t('users.learner') },
    { key: 'courseTitle', header: t('enroll.course') },
    { key: 'totalCents', header: t('payments.total'), class: 'text-right', format: (r: any) => `€${(r.totalCents / 100).toFixed(2)}` },
    { key: 'status', header: t('payments.title'), format: (r: any) => tStatus(r.status) },
  ];

  const invoiceColumns = [
    { key: 'number', header: t('payments.invoice') },
    { key: 'learnerEmail', header: t('common.email') },
    { key: 'courseTitle', header: t('enroll.course') },
    { key: 'totalCents', header: t('payments.total'), class: 'text-right', format: (r: any) => `€${(r.totalCents / 100).toFixed(2)}` },
    { key: 'createdAt', header: t('payments.date') },
  ];

  $effect(() => {
    if (form?.error) toast.error(tError(form.error));
  });
  $effect(() => {
    if (form?.ok && form.invoiceNumber) {
      toast.success(t('payments.confirmed', { number: form.invoiceNumber }));
    }
  });
</script>

<svelte:head>
  <title>{t('payments.title')} — GeberLMS</title>
</svelte:head>

<PageHeader title={t('payments.title')} />

<div class="mt-6 space-y-8">
  <section>
    <h2 class="font-display text-lg font-semibold">{t('payments.title')}</h2>
    <div class="mt-3">
      <DataTable
        data={data.enrollments}
        columns={enrollmentColumns}
        rowKey="enrollmentId"
        empty={t('payments.none')}
        searchable
        searchKeys={['learnerName', 'courseTitle']}
        searchPlaceholder={t('catalog.search')}
      >
        {#snippet actions(row)}
          {#if row.status === 'pending'}
            <form method="POST" action="?/markPaid">
              <input type="hidden" name="enrollmentId" value={row.enrollmentId} />
              <Button type="submit" size="sm">{t('payments.markPaid')}</Button>
            </form>
          {/if}
        {/snippet}
      </DataTable>
    </div>
  </section>

  <section>
    <h2 class="font-display text-lg font-semibold">{t('payments.invoices')}</h2>
    <div class="mt-3">
      <DataTable
        data={data.invoices}
        columns={invoiceColumns}
        rowKey="number"
        empty={t('payments.none')}
        searchable
        searchKeys={['number', 'learnerEmail', 'courseTitle']}
        searchPlaceholder={t('catalog.search')}
      />
    </div>
  </section>
</div>
