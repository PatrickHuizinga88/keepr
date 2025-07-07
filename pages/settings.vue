<script setup lang="ts">
import {Page} from "../components/ui/page";

const {t} = useI18n()

useHead({
  title: t('settings.settings', 2),
})
</script>

<template>
  <Page :title="$t('settings.settings', 2)">
    <FormSettings/>
  </Page>
</template>
