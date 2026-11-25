<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import SearchIcon from '@lucide/svelte/icons/search';
  import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import type { Snippet } from 'svelte';

  let {
    data,
    columns,
    actions,
    searchable = false,
    searchKeys = [],
    searchPlaceholder = '',
    empty = '—',
    rowKey = 'id',
    pageSize = 10,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    columns: { key: string; header: string; class?: string; format?: (row: any) => unknown }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions?: Snippet<[any]>;
    searchable?: boolean;
    searchKeys?: string[];
    searchPlaceholder?: string;
    empty?: string;
    rowKey?: string;
    pageSize?: number;
  } = $props();

  let query = $state('');
  let page = $state(1);

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q || searchKeys.length === 0) return data;
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
    );
  });

  const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
  const pageRows = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

  $effect(() => {
    if (page > totalPages) page = totalPages;
  });
</script>

<div class="space-y-3">
  {#if searchable}
    <div class="relative max-w-sm">
      <SearchIcon
        class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input bind:value={query} placeholder={searchPlaceholder} class="pl-8" />
    </div>
  {/if}

  <div class="overflow-hidden rounded-lg border bg-background">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {#each columns as col (col.key)}
            <Table.Head class={col.class}>{col.header}</Table.Head>
          {/each}
          {#if actions}
            <Table.Head class="w-10 text-right"></Table.Head>
          {/if}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if pageRows.length === 0}
          <Table.Row>
            <Table.Cell colspan={columns.length + (actions ? 1 : 0)} class="py-8 text-center text-muted-foreground">
              {empty}
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each pageRows as row (String(row[rowKey] ?? JSON.stringify(row)))}
            <Table.Row>
              {#each columns as col (col.key)}
                <Table.Cell class={col.class}>{col.format ? col.format(row) : row[col.key]}</Table.Cell>
              {/each}
              {#if actions}
                <Table.Cell class="text-right">{@render actions(row)}</Table.Cell>
              {/if}
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  {#if totalPages > 1}
    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span>{page} / {totalPages}</span>
      <div class="flex gap-1">
        <Button variant="outline" size="sm" onclick={() => (page = Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeftIcon class="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onclick={() => (page = Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRightIcon class="size-4" />
        </Button>
      </div>
    </div>
  {/if}
</div>
