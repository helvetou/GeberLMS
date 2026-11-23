<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t, tError } = useI18n();
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
  <title>{t('courses.title')} — GeberLMS</title>
</svelte:head>

<h1>{t('courses.title')}</h1>

{#if data.error}
  <p role="alert">{tError(data.error)}</p>
{/if}

{#if form?.error}
  <p role="alert">{tError(form.error)}</p>
{/if}

<h2>{t('courses.new')}</h2>
<form method="POST" action="?/createCourse">
  <label>{t('common.title')} <input type="text" name="title" required /></label>
  <label>{t('courses.slug')} <input type="text" name="slug" required /></label>
  <label>
    {t('courses.language')}
    <select name="language">
      <option value="fr">fr</option>
      <option value="en">en</option>
      <option value="ar">ar</option>
      <option value="de">de</option>
    </select>
  </label>
  <label>{t('courses.price')} <input type="number" name="priceCents" value="0" min="0" required /></label>
  <button type="submit">{t('common.create')}</button>
</form>

<hr />

{#each data.catalog as node (node.course.id)}
  <details open>
    <summary>
      <strong>{node.course.title}</strong>
      <span> ({node.course.language}, €{(node.course.priceCents ?? 0) / 100})</span>
      {#if node.course.visibility === 'hidden'}<span> — {t('common.hidden')}</span>{/if}
    </summary>

    <div>
      <form method="POST" action="?/renameCourse" style="display: inline">
        <input type="hidden" name="id" value={node.course.id} />
        <input type="text" name="title" value={node.course.title} required />
        <button type="submit">{t('common.rename')}</button>
      </form>
      <form method="POST" action="?/toggleCourse" style="display: inline">
        <input type="hidden" name="id" value={node.course.id} />
        <input type="hidden" name="visibility" value={nextVisibility(node.course.visibility)} />
        <button type="submit">{labelToggle(node.course.visibility)}</button>
      </form>
      <form method="POST" action="?/deleteCourse" style="display: inline">
        <input type="hidden" name="id" value={node.course.id} />
        <button type="submit">{t('common.delete')}</button>
      </form>
    </div>

    <h3>{t('courses.modules')}</h3>
    <form method="POST" action="?/createModule">
      <input type="hidden" name="courseId" value={node.course.id} />
      <input type="text" name="title" placeholder={t('courses.moduleTitle')} required />
      <input type="number" name="position" value="0" min="0" style="width: 4em" />
      <button type="submit">{t('courses.addModule')}</button>
    </form>

    <ul>
      {#each node.modules as m (m.module.id)}
        <li>
          <strong>{m.module.title}</strong>
          {#if m.module.visibility === 'hidden'}<span> — {t('common.hidden')}</span>{/if}
          <form method="POST" action="?/renameModule" style="display: inline">
            <input type="hidden" name="id" value={m.module.id} />
            <input type="text" name="title" value={m.module.title} required />
            <button type="submit">{t('common.rename')}</button>
          </form>
          <form method="POST" action="?/toggleModule" style="display: inline">
            <input type="hidden" name="id" value={m.module.id} />
            <input type="hidden" name="visibility" value={nextVisibility(m.module.visibility)} />
            <button type="submit">{labelToggle(m.module.visibility)}</button>
          </form>
          <form method="POST" action="?/deleteModule" style="display: inline">
            <input type="hidden" name="id" value={m.module.id} />
            <button type="submit">{t('common.delete')}</button>
          </form>

          <form method="POST" action="?/createLesson">
            <input type="hidden" name="moduleId" value={m.module.id} />
            <input type="text" name="title" placeholder={t('courses.lessonTitle')} required />
            <select name="type">
              <option value="video">video</option>
              <option value="text">text</option>
              <option value="quiz">quiz</option>
            </select>
            <input type="number" name="position" value="0" min="0" style="width: 4em" />
            <button type="submit">{t('courses.addLesson')}</button>
          </form>

          <ul>
            {#each m.lessons as l (l.lesson.id)}
              <li>
                <strong>{l.lesson.title}</strong>
                <span> ({l.lesson.type})</span>
                {#if l.lesson.visibility === 'hidden'}<span> — {t('common.hidden')}</span>{/if}
                <form method="POST" action="?/renameLesson" style="display: inline">
                  <input type="hidden" name="id" value={l.lesson.id} />
                  <input type="text" name="title" value={l.lesson.title} required />
                  <button type="submit">{t('common.rename')}</button>
                </form>
                <form method="POST" action="?/toggleLesson" style="display: inline">
                  <input type="hidden" name="id" value={l.lesson.id} />
                  <input type="hidden" name="visibility" value={nextVisibility(l.lesson.visibility)} />
                  <button type="submit">{labelToggle(l.lesson.visibility)}</button>
                </form>
                <form method="POST" action="?/deleteLesson" style="display: inline">
                  <input type="hidden" name="id" value={l.lesson.id} />
                  <button type="submit">{t('common.delete')}</button>
                </form>

                <form method="POST" action="?/createResource">
                  <input type="hidden" name="lessonId" value={l.lesson.id} />
                  <input type="text" name="title" placeholder={t('courses.resourceTitle')} required />
                  <button type="submit">{t('courses.addResource')}</button>
                </form>

                <ul>
                  {#each l.resources as r (r.id)}
                    <li>
                      {r.title}
                      {#if r.visibility === 'hidden'}<span> — {t('common.hidden')}</span>{/if}
                      <form method="POST" action="?/renameResource" style="display: inline">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="text" name="title" value={r.title} required />
                        <button type="submit">{t('common.rename')}</button>
                      </form>
                      <form method="POST" action="?/toggleResource" style="display: inline">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="visibility" value={nextVisibility(r.visibility)} />
                        <button type="submit">{labelToggle(r.visibility)}</button>
                      </form>
                      <form method="POST" action="?/deleteResource" style="display: inline">
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit">{t('common.delete')}</button>
                      </form>
                    </li>
                  {/each}
                </ul>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </details>
{/each}
