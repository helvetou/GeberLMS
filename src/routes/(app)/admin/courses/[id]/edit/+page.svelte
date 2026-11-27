<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
  import { Button } from '$lib/components/ui/button/index.js';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();

  function nextVisibility(current: string): string {
    return current === 'visible' ? 'hidden' : 'visible';
  }

  function labelToggle(current: string): string {
    return current === 'visible' ? t('common.hide') : t('common.show');
  }
</script>

<svelte:head>
  <title>{data.detail?.course.title ?? t('courses.title')} — {t('courses.editTitle')} — GeberLMS</title>
</svelte:head>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{:else if !data.detail}
  <p role="alert">{t('catalog.notFound')}</p>
{:else}
  {@const course = data.detail.course}
  <a href={`/admin/courses/${course.id}`} class="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
    <ArrowLeftIcon class="size-4" /> {t('catalog.back')}
  </a>

  <h1 class="font-display text-2xl font-semibold tracking-tight">
    {course.title} <span class="text-muted-foreground">— {t('courses.editTitle')}</span>
  </h1>

  {#if form?.error}
    <p role="alert" class="mt-3">{tError(form.error)}</p>
  {/if}

  <section class="mt-6 rounded-lg border bg-background p-4">
    <h2 class="font-medium">{t('courses.title')}</h2>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <form method="POST" action="?/renameCourse" class="flex items-center gap-2">
        <input type="hidden" name="id" value={course.id} />
        <input type="text" name="title" value={course.title} required class="h-9 rounded-md border border-input bg-transparent px-2" />
        <Button type="submit" variant="outline" size="sm">{t('common.rename')}</Button>
      </form>
      <form method="POST" action="?/toggleCourse">
        <input type="hidden" name="id" value={course.id} />
        <input type="hidden" name="visibility" value={nextVisibility(course.visibility)} />
        <Button type="submit" variant="outline" size="sm">
          {#if course.visibility === 'hidden'}<EyeOffIcon class="size-4" />{/if}
          {labelToggle(course.visibility)}
        </Button>
      </form>
      <form method="POST" action="?/deleteCourse">
        <input type="hidden" name="id" value={course.id} />
        <Button type="submit" variant="destructive" size="sm">{t('common.delete')}</Button>
      </form>
    </div>
  </section>

  <section class="mt-6">
    <h2 class="font-display text-lg font-semibold">{t('courses.modules')}</h2>
    <form method="POST" action="?/createModule" class="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="courseId" value={course.id} />
      <input type="text" name="title" placeholder={t('courses.moduleTitle')} required class="h-9 rounded-md border border-input bg-transparent px-2" />
      <input type="number" name="position" value="0" min="0" class="h-9 w-16 rounded-md border border-input bg-transparent px-2" />
      <Button type="submit" variant="outline" size="sm">{t('courses.addModule')}</Button>
    </form>

    {#if data.detail.modules.length === 0}
      <p class="mt-3 text-muted-foreground">{t('catalog.noModules')}</p>
    {:else}
      <ul class="mt-4 space-y-4">
        {#each data.detail.modules as m (m.module.id)}
          <li class="rounded-lg border bg-background p-4">
            <div class="flex flex-wrap items-center gap-2">
              <strong>{m.module.title}</strong>
              {#if m.module.visibility === 'hidden'}<span class="text-xs text-muted-foreground">— {t('common.hidden')}</span>{/if}
              <form method="POST" action="?/renameModule" class="flex items-center gap-2">
                <input type="hidden" name="id" value={m.module.id} />
                <input type="text" name="title" value={m.module.title} required class="h-8 rounded-md border border-input bg-transparent px-2 text-sm" />
                <Button type="submit" variant="ghost" size="sm">{t('common.rename')}</Button>
              </form>
              <form method="POST" action="?/toggleModule">
                <input type="hidden" name="id" value={m.module.id} />
                <input type="hidden" name="visibility" value={nextVisibility(m.module.visibility)} />
                <Button type="submit" variant="ghost" size="sm">{labelToggle(m.module.visibility)}</Button>
              </form>
              <form method="POST" action="?/deleteModule">
                <input type="hidden" name="id" value={m.module.id} />
                <Button type="submit" variant="ghost" size="sm">{t('common.delete')}</Button>
              </form>
            </div>

            <form method="POST" action="?/createLesson" class="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="moduleId" value={m.module.id} />
              <input type="text" name="title" placeholder={t('courses.lessonTitle')} required class="h-9 rounded-md border border-input bg-transparent px-2" />
              <select name="type" class="h-9 rounded-md border border-input bg-transparent px-2">
                <option value="video">video</option>
                <option value="text">text</option>
                <option value="quiz">quiz</option>
              </select>
              <input type="number" name="position" value="0" min="0" class="h-9 w-16 rounded-md border border-input bg-transparent px-2" />
              <Button type="submit" variant="outline" size="sm">{t('courses.addLesson')}</Button>
            </form>

            {#if m.lessons.length > 0}
              <ul class="mt-3 space-y-3 pl-4">
                {#each m.lessons as row (row.lesson.id)}
                  {@const lesson = row.lesson}
                  <li class="rounded-md border p-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <strong>{lesson.title}</strong>
                      <span class="text-xs text-muted-foreground">({lesson.type})</span>
                      {#if lesson.visibility === 'hidden'}<span class="text-xs text-muted-foreground">— {t('common.hidden')}</span>{/if}
                      <form method="POST" action="?/renameLesson" class="flex items-center gap-2">
                        <input type="hidden" name="id" value={lesson.id} />
                        <input type="text" name="title" value={lesson.title} required class="h-8 rounded-md border border-input bg-transparent px-2 text-sm" />
                        <Button type="submit" variant="ghost" size="sm">{t('common.rename')}</Button>
                      </form>
                      <form method="POST" action="?/toggleLesson">
                        <input type="hidden" name="id" value={lesson.id} />
                        <input type="hidden" name="visibility" value={nextVisibility(lesson.visibility)} />
                        <Button type="submit" variant="ghost" size="sm">{labelToggle(lesson.visibility)}</Button>
                      </form>
                      <form method="POST" action="?/deleteLesson">
                        <input type="hidden" name="id" value={lesson.id} />
                        <Button type="submit" variant="ghost" size="sm">{t('common.delete')}</Button>
                      </form>
                    </div>

                    <form method="POST" action="?/createResource" class="mt-2 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="text" name="title" placeholder={t('courses.resourceTitle')} required class="h-8 rounded-md border border-input bg-transparent px-2 text-sm" />
                      <Button type="submit" variant="outline" size="sm">{t('courses.addResource')}</Button>
                    </form>

                    {#if row.resources.length > 0}
                      <ul class="mt-2 space-y-1 pl-4">
                        {#each row.resources as r (r.id)}
                          <li class="flex flex-wrap items-center gap-2 text-sm">
                            {r.title}
                            {#if r.visibility === 'hidden'}<span class="text-xs text-muted-foreground">— {t('common.hidden')}</span>{/if}
                            <form method="POST" action="?/renameResource" class="flex items-center gap-1">
                              <input type="hidden" name="id" value={r.id} />
                              <input type="text" name="title" value={r.title} required class="h-7 rounded-md border border-input bg-transparent px-2 text-sm" />
                              <Button type="submit" variant="ghost" size="sm">{t('common.rename')}</Button>
                            </form>
                            <form method="POST" action="?/toggleResource">
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="visibility" value={nextVisibility(r.visibility)} />
                              <Button type="submit" variant="ghost" size="sm">{labelToggle(r.visibility)}</Button>
                            </form>
                            <form method="POST" action="?/deleteResource">
                              <input type="hidden" name="id" value={r.id} />
                              <Button type="submit" variant="ghost" size="sm">{t('common.delete')}</Button>
                            </form>
                          </li>
                        {/each}
                      </ul>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}
