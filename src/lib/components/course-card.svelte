<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
  import type { Course } from '$lib/domain/catalog';

  let { course }: { course: Course } = $props();
  const { t } = useI18n();

  const GRADIENTS = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-sky-500 to-blue-500',
  ] as const;

  function gradientFor(category: string | null | undefined): string {
    if (!category) return GRADIENTS[0];
    let h = 0;
    for (const c of category) h = (h * 31 + c.charCodeAt(0)) % 997;
    return GRADIENTS[h % GRADIENTS.length]!;
  }

  function priceLabel(priceCents: number | undefined): string {
    if (!priceCents || priceCents <= 0) return t('catalog.free');
    return `€${(priceCents / 100).toFixed(2)}`;
  }

  const initial = $derived((course.title.trim()[0] ?? '?').toUpperCase());
</script>

<a href={`/catalog/${course.slug}`} class="group block h-full focus-visible:outline-none">
  <Card.Root
    class="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg"
  >
    <div
      class="flex h-28 items-center justify-center bg-gradient-to-br {gradientFor(course.category)}"
    >
      <span class="font-display text-4xl font-semibold text-white/80">{initial}</span>
    </div>
    <Card.Header>
      <Card.Title class="line-clamp-2">{course.title}</Card.Title>
      <Card.Description class="line-clamp-2">{course.description ?? ''}</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-wrap items-center gap-2">
        {#if course.category}<Badge variant="secondary">{course.category}</Badge>{/if}
        {#if course.level}<Badge variant="outline">{course.level}</Badge>{/if}
        <span class="ml-auto text-sm font-semibold">{priceLabel(course.priceCents)}</span>
      </div>
    </Card.Content>
    <Card.Footer class="pt-0">
      <span
        class="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
      >
        {t('catalog.learnMore')} <ArrowRightIcon class="size-4" />
      </span>
    </Card.Footer>
  </Card.Root>
</a>
