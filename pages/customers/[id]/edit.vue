<script setup lang="ts">
import type {Database} from "~/types/database.types";
import {Page} from "../../../components/ui/page";

const supabase = useSupabaseClient<Database>()
const toastStore = useToastStore()
const {t} = useI18n()

const {data: customer} = await useAsyncData(async () => {
  try {
    const {data, error} = await supabase.from('customers')
        .select('*')
        .eq('id', useRoute().params.id)
        .single()
    if (error) throw error
    return data
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'retrieve',
      item: t('customers.customers'),
    })
    console.error(error)
  }
})

useHead({
  title: t('common.actions.edit_item', {item: `${customer.value?.first_name} ${customer.value?.last_name}`}),
})
</script>

<template>
  <Page :title="$t('common.actions.edit_item', {item: `${customer.first_name} ${customer.last_name}`})">
    <FormCustomer v-if="customer" :customer="customer"/>
    <p v-else>{{ $t('not_found', {item: $t('customers.customers')}) }}</p>
  </Page>
</template>
