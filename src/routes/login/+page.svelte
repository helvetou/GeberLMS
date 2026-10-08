<script lang="ts">
  import { useI18n } from '$lib/i18n.svelte';
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
  import type { PageProps } from './$types';

  const { t } = useI18n();
  let { form }: PageProps = $props();
</script>

<svelte:head>
  <title>{t('login.title')} — GeberLMS</title>
</svelte:head>

<div class="flex min-h-svh flex-col bg-muted/40">
  <header class="flex h-14 items-center justify-between border-b bg-background px-4">
    <a href="/" class="font-display text-lg font-semibold">{t('brand.name')}</a>
    <LangSwitch />
  </header>

  <main class="flex flex-1 items-center justify-center p-4">
    <Card.Root class="w-full max-w-sm">
      <Card.Header class="text-center">
        <Card.Title class="text-2xl">{t('login.title')}</Card.Title>
        <Card.Description>{t('login.subtitle')}</Card.Description>
      </Card.Header>
      <Card.Content>
        <form method="POST" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label for="email">{t('common.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autocomplete="username"
              placeholder="email@example.com"
              required
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="password">{t('common.password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>

          {#if form?.error}
            <Alert.Root variant="destructive">
              <TriangleAlertIcon />
              <Alert.Description>{form.error}</Alert.Description>
            </Alert.Root>
          {/if}

          <Button type="submit" class="w-full">{t('login.submit')}</Button>
        </form>
      </Card.Content>
    </Card.Root>
  </main>
</div>
