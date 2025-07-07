<script setup lang="ts">
import {CheckCircle} from 'lucide-vue-next'
import {APP_NAME} from "~/constants";
import Authentication from "~/layouts/authentication.vue";

definePageMeta({
  layout: false,
})

const {t} = useI18n()

useHead({
  title: t('authentication.register.account_activated'),
})
</script>

<template>
  <Authentication title="">
    <CheckCircle class="size-16 text-success mb-6 mx-auto"/>
    <h1 class="text-3xl font-semibold text-center mb-2">{{ $t('authentication.register.account_activated') }}</h1>
    <p class="text-muted-foreground text-center">{{ $t('authentication.register.welcome_to', {appName: APP_NAME}) }}</p>
    <Button class="w-full mt-6" as-child>
      <NuxtLinkLocale to="intro">
        {{ $t('authentication.register.continue') }}
      </NuxtLinkLocale>
    </Button>
  </Authentication>
</template>
