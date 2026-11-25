<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import { toast } from 'svelte-sonner';
  import PageHeader from '$lib/components/page-header.svelte';
  import DataTable from '$lib/components/data-table.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import TicketIcon from '@lucide/svelte/icons/ticket';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  const columns = [
    { key: 'code', header: t('coupons.code') },
    {
      key: 'value',
      header: t('coupons.value'),
      format: (r: any) => (r.type === 'percent' ? `${r.value} %` : `€${(r.value / 100).toFixed(2)}`),
    },
    {
      key: 'uses',
      header: t('coupons.uses'),
      format: (r: any) => (r.maxUses !== null ? `${r.usedCount}/${r.maxUses}` : `${r.usedCount}`),
    },
    { key: 'expiresAt', header: t('coupons.expiration'), format: (r: any) => r.expiresAt ?? '—' },
    {
      key: 'enabled',
      header: t('coupons.title'),
      format: (r: any) => (r.enabled ? t('common.show') : t('coupons.disabled')),
    },
  ];

  $effect(() => {
    if (form?.error) toast.error(tError(form.error));
  });
</script>

<svelte:head>
  <title>{t('coupons.title')} — GeberLMS</title>
</svelte:head>

<PageHeader title={t('coupons.title')} />

{#if data.error}
  <p role="alert" class="mt-4">{tError(data.error)}</p>
{/if}

<Card.Root class="mt-6">
  <Card.Header>
    <Card.Title>{t('coupons.new')}</Card.Title>
  </Card.Header>
  <Card.Content>
    <form method="POST" action="?/create" class="flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-2">
        <Label for="code">{t('coupons.code')}</Label>
        <Input id="code" name="code" required />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="type">{t('coupons.type')}</Label>
        <select id="type" name="type" class="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="percent">{t('coupons.percent')}</option>
          <option value="amount">{t('coupons.amount')}</option>
        </select>
      </div>
      <div class="flex flex-col gap-2">
        <Label for="value">{t('coupons.value')}</Label>
        <Input id="value" name="value" type="number" min="0" required />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="expiresAt">{t('coupons.expiration')}</Label>
        <Input id="expiresAt" name="expiresAt" type="date" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="maxUses">{t('coupons.maxUses')}</Label>
        <Input id="maxUses" name="maxUses" type="number" min="0" />
      </div>
      <Button type="submit">{t('common.create')}</Button>
    </form>
  </Card.Content>
</Card.Root>

<div class="mt-6">
  {#if data.coupons.length === 0}
    <EmptyState icon={TicketIcon} title={t('coupons.none')} />
  {:else}
    <DataTable data={data.coupons} {columns} rowKey="id" searchable searchKeys={['code']} searchPlaceholder={t('catalog.search')}>
      {#snippet actions(row)}
        <form method="POST" action="?/toggle">
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="enabled" value={!row.enabled} />
          <Button type="submit" variant={row.enabled ? 'outline' : 'default'} size="sm">
            {row.enabled ? t('coupons.disable') : t('coupons.enable')}
          </Button>
        </form>
      {/snippet}
    </DataTable>
  {/if}
</div>
