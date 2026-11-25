<script lang="ts">
  import { enhance } from '$app/forms';
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import { toast } from 'svelte-sonner';
  import PageHeader from '$lib/components/page-header.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import SaveIcon from '@lucide/svelte/icons/save';
  import BookOpenIcon from '@lucide/svelte/icons/book-open';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
  let saving = $state(false);

  $effect(() => {
    if (form?.error) toast.error(tError(form.error));
  });
  $effect(() => {
    if (form?.ok && form.saved) toast.success(t('quran.tafseerSaved'));
  });
</script>

<svelte:head>
  <title>{data.surah ? `${data.surah.nameAr} — ${t('quran.edit')}` : t('quran.tafseer')} — GeberLMS</title>
</svelte:head>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{:else if !data.surah}
  <p role="alert">{tError('errors.surah_not_found')}</p>
{:else}
  {@const s = data.surah}
  <PageHeader
    title={`${s.surahNo} · ${s.nameAr}`}
    subtitle={s.nameEn}
  >
    {#snippet actions()}
      <Button variant="outline" href={`/quran/tafseer/${s.surahNo}`}>
        {t('common.show')}
      </Button>
      <Button variant="outline" href={`/quran/#p=${s.startPage}`}>
        <BookOpenIcon class="size-4" /> {t('quran.openMushaf')}
      </Button>
    {/snippet}
  </PageHeader>

  <form
    method="POST"
    action="?/save"
    class="mt-6"
    use:enhance={() => {
      saving = true;
      return async ({ update }) => {
        await update();
        saving = false;
      };
    }}
  >
    <Textarea
      name="tafseerMd"
      rows={22}
      class="font-mono text-sm"
      dir="rtl"
      placeholder="# تفسير …"
      value={data.tafseer ?? ''}
    ></Textarea>
    <Button type="submit" class="mt-3" disabled={saving}>
      {#if saving}<span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>{/if}
      <SaveIcon class="size-4" /> {t('common.create')}
    </Button>
  </form>

  <p class="mt-2 text-xs text-muted-foreground">
    {t('quran.pages')} {s.startPage}–{s.endPage}
  </p>
{/if}
