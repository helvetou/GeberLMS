<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import BookOpenIcon from '@lucide/svelte/icons/book-open';
  import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  function lessonCount(node: (typeof data.catalog)[number]): number {
    return node.modules.reduce((n, m) => n + m.lessons.length, 0);
  }

  function priceLabel(priceCents: number | undefined): string {
    if (!priceCents || priceCents <= 0) return t('catalog.free');
    return `€${(priceCents / 100).toFixed(2)}`;
  }
</script>

<svelte:head>
  <title>{t('courses.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('courses.title')}</h1>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{/if}

<details class="mt-4 rounded-lg border bg-background p-4">
  <summary class="cursor-pointer font-medium">{t('courses.new')}</summary>
  <form method="POST" action="?/createCourse" class="mt-3 grid gap-3 sm:grid-cols-2">
    <label class="grid gap-1 text-sm">
      {t('common.title')}
      <input type="text" name="title" required class="h-9 rounded-md border border-input bg-transparent px-2" />
    </label>
    <label class="grid gap-1 text-sm">
      {t('courses.slug')}
      <input type="text" name="slug" required class="h-9 rounded-md border border-input bg-transparent px-2" />
    </label>
    <label class="grid gap-1 text-sm">
      {t('courses.language')}
      <select name="language" class="h-9 rounded-md border border-input bg-transparent px-2">
        <option value="fr">fr</option>
        <option value="en">en</option>
        <option value="ar">ar</option>
        <option value="de">de</option>
      </select>
    </label>
    <label class="grid gap-1 text-sm">
      {t('courses.price')}
      <input type="number" name="priceCents" value="0" min="0" required class="h-9 rounded-md border border-input bg-transparent px-2" />
    </label>
    <label class="grid gap-1 text-sm">
      {t('courses.category')}
      <input type="text" name="category" class="h-9 rounded-md border border-input bg-transparent px-2" />
    </label>
    <label class="grid gap-1 text-sm">
      {t('courses.level')}
      <input type="text" name="level" class="h-9 rounded-md border border-input bg-transparent px-2" />
    </label>
    <label class="grid gap-1 text-sm">
      {t('courses.tutor')}
      <select name="tutorId" class="h-9 rounded-md border border-input bg-transparent px-2">
        <option value="">{t('learner.none')}</option>
        {#each data.tutors as tutor (tutor.id)}
          <option value={tutor.id}>{tutor.name ?? tutor.email}</option>
        {/each}
      </select>
    </label>
    <label class="grid gap-1 text-sm sm:col-span-2">
      {t('courses.description')}
      <textarea name="description" rows="2" class="rounded-md border border-input bg-transparent px-2 py-1"></textarea>
    </label>
    <label class="flex items-center gap-2 text-sm sm:col-span-2">
      <input type="checkbox" name="isPublic" class="accent-primary" /> {t('courses.public')}
    </label>
    <div class="sm:col-span-2">
      <Button type="submit">{t('common.create')}</Button>
    </div>
  </form>
</details>

<details class="mt-3 rounded-lg border bg-background p-4">
  <summary class="cursor-pointer font-medium">{t('courses.import')}</summary>
  <form method="POST" action="?/importCourse" class="mt-3 grid gap-3">
    <label class="grid gap-1 text-sm">
      {t('courses.importMode')}
      <select name="mode" class="h-9 rounded-md border border-input bg-transparent px-2">
        <option value="strict">{t('courses.importStrict')}</option>
        <option value="upsert">{t('courses.importUpsert')}</option>
      </select>
    </label>
    <label class="grid gap-1 text-sm">
      {t('courses.importJson')}
      <textarea name="json" rows="8" required class="rounded-md border border-input bg-transparent px-2 py-1 font-mono text-xs" placeholder="Collez le JSON du cours (title, slug, language, price_cents, modules…)"></textarea>
    </label>
    <div>
      <Button type="submit">{t('courses.importSubmit')}</Button>
    </div>
  </form>

  {#if form?.ok && form.slug}
    <p role="status" class="mt-3 text-sm text-muted-foreground">
      {t('courses.imported', { slug: form.slug, modules: form.modules, lessons: form.lessons })}
    </p>
  {/if}
  {#if form?.error}
    <p role="alert" class="mt-3">{tError(form.error)}</p>
  {/if}
</details>

{#if data.catalog.length === 0}
  <p class="mt-8 text-muted-foreground">{t('catalog.noCourses')}</p>
{:else}
  <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.catalog as node (node.course.id)}
      <a href={`/admin/courses/${node.course.id}`} class="group block h-full focus-visible:outline-none">
        <Card.Root class="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
          <Card.Header>
            <div class="flex items-start gap-2">
              <div class="rounded-md bg-muted p-2 text-muted-foreground"><BookOpenIcon class="size-4" /></div>
              <div class="min-w-0">
                <Card.Title class="line-clamp-2">{node.course.title}</Card.Title>
                {#if node.course.description}
                  <Card.Description class="line-clamp-2">{node.course.description}</Card.Description>
                {/if}
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{t(`lang.${node.course.language}`)}</Badge>
              {#if node.course.category}<Badge variant="secondary">{node.course.category}</Badge>{/if}
              {#if node.course.visibility === 'hidden'}
                <Badge variant="destructive"><EyeOffIcon class="size-3" /> {t('common.hidden')}</Badge>
              {/if}
              <span class="ml-auto text-sm font-semibold">{priceLabel(node.course.priceCents)}</span>
            </div>
            <p class="mt-3 text-xs text-muted-foreground">
              {node.modules.length} {t('courses.modules')} · {lessonCount(node)} {t('common.lessons')}
            </p>
          </Card.Content>
          <Card.Footer class="pt-0">
            <span class="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              {t('catalog.learnMore')} <ArrowRightIcon class="size-4" />
            </span>
          </Card.Footer>
        </Card.Root>
      </a>
    {/each}
  </div>
{/if}
