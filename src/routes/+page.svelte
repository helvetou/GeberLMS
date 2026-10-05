<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  const { t } = useI18n();
</script>

<h1>{t('brand.name')}</h1>
<p>{t('brand.tagline')}</p>
