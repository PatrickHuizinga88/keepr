<script setup lang="ts">
import {Page} from "../../components/ui/page";

const {t} = useI18n()

useHead({
  title: t('common.general.new', {item: lowercase(t('customers.customers'))}),
})
</script>

<template>
  <Page :title="$t('common.general.new', {item: lowercase($t('customers.customers'))})">
    <FormCustomer />
  </Page>
</template>