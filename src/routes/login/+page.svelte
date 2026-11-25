<script lang="ts">
  import { enhance } from '$app/forms';
  import { useI18n } from '$lib/i18n.svelte';
  import LangSwitch from '$lib/components/layout/lang-switch.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
  import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
  import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
  import type { PageProps } from './$types';

  const { t, tError } = useI18n();
  let { form }: PageProps = $props();
  let submitting = $state(false);
</script>

<svelte:head>
  <title>{t('login.title')} — GeberLMS</title>
</svelte:head>

<div class="grid min-h-svh lg:grid-cols-2">
  <!-- Panneau de marque (desktop) -->
  <div class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white lg:flex">
    <a href="/" class="flex items-center gap-2 font-display text-xl font-semibold">
      <GraduationCapIcon class="size-7" />
      {t('brand.name')}
    </a>
    <div class="space-y-4">
      <h1 class="font-display text-4xl font-semibold leading-tight tracking-tight">
        {t('login.brandLead')}
      </h1>
      <p class="max-w-md text-lg text-indigo-100">{t('brand.tagline')}</p>
    </div>
    <div class="flex items-center gap-2 text-sm text-indigo-200">
      <span class="h-px flex-1 bg-white/20"></span>
      <span>{t('lang.label')}</span>
      <LangSwitch />
    </div>
  </div>

  <!-- Formulaire -->
  <div class="flex flex-col bg-muted/30">
    <header class="flex h-14 items-center justify-between border-b bg-background/60 px-4 lg:hidden">
      <a href="/" class="font-display text-lg font-semibold">{t('brand.name')}</a>
      <LangSwitch />
    </header>

    <main class="flex flex-1 items-center justify-center p-4 md:p-8">
      <div class="w-full max-w-sm">
        <div class="mb-6 text-center lg:text-left">
          <p class="font-display text-2xl font-semibold">{t('login.title')}</p>
          <p class="mt-1 text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <Card.Root>
          <Card.Content>
            <form
              method="POST"
              class="flex flex-col gap-4"
              use:enhance={() => {
                submitting = true;
                return async ({ update }) => {
                  await update();
                  submitting = false;
                };
              }}
            >
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
                  <Alert.Description>{tError(form.error)}</Alert.Description>
                </Alert.Root>
              {/if}

              <Button type="submit" class="w-full" disabled={submitting}>
                {#if submitting}
                  <LoaderCircleIcon class="size-4 animate-spin" />
                {/if}
                {t('login.submit')}
              </Button>
            </form>
          </Card.Content>
        </Card.Root>
      </div>
    </main>
  </div>
</div>
