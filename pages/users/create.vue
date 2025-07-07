<script setup lang="ts">
import {Page} from "../../components/ui/page";

const {t} = useI18n()

useHead({
  title: t('common.general.new', {item: lowercase(t('users.users'))}),
})
</script>

<template>
  <Page :title="$t('common.general.new', {item: lowercase($t('users.users'))})">
    <FormUser />
  </Page>
</template>