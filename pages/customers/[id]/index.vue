<script setup lang="ts">
import {Trash, Pencil} from 'lucide-vue-next'
import {Card, CardHeader, CardTitle} from "~/components/ui/card";
import type {Database} from "~/types/database.types";
import {Page, PageActions, PageBackButton, PageHeader} from "../../../components/ui/page";

const supabase = useSupabaseClient<Database>()
const toastStore = useToastStore()
const {t} = useI18n()
const localePath = useLocalePath()

const dialogOpen = ref(false)
const loadingDelete = ref(false)

const {data: customer} = await useAsyncData(async () => {
  const {data} = await supabase.from('customers')
      .select('*')
      .eq('id', useRoute().params.id)
      .single()
  return data
})

useHead({
  title: `${customer.value?.first_name} ${customer.value?.last_name}`,
})

const deleteCustomer = async () => {
  try {
    loadingDelete.value = true
    const {error} = await supabase.from('customers').delete().filter('id', 'eq', customer.value.id)
    if (error) throw error
    await navigateTo(localePath('customers'))
    toastStore.createToast({
      type: 'success',
      action: 'delete',
      item: `${customer.value?.first_name} ${customer.value?.last_name}` || t('customers.customers'),
    })
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'delete',
      item: `${customer.value?.first_name} ${customer.value?.last_name}` || t('customers.customers'),
    })
    dialogOpen.value = false
    console.error(error)
  } finally {
    loadingDelete.value = false
  }
}
</script>

<template>
  <Page :title="`${customer?.first_name} ${customer?.last_name}` || $t('customers.customers')" :customBreadcrumb="true">
    <PageHeader>
      <PageBackButton to="/customers"
                      :label="capitalizeSentence($t('common.actions.back_to_item', {item: $t('customers.customers', 2)}))"/>
      <PageActions>
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button
                variant="outline"
                size="sm"
            >
              <Trash aria-hidden="true"/>
              {{ $t('common.actions.delete') }}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{{
                  capitalizeSentence($t('common.actions.delete_item', {item: $t('customers.customers')}))
                }}
              </DialogTitle>
              <DialogDescription>
                {{ $t('common.actions.delete_confirmation', {item: lowercase($t('customers.customers'))}) }}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                  variant="outline"
                  @click="dialogOpen = false"
              >
                {{ $t('common.actions.cancel') }}
              </Button>
              <Button
                  variant="destructive"
                  @click="deleteCustomer"
              >
                {{ $t('common.actions.delete') }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
            size="sm"
            as-child
        >
          <NuxtLink :to="localePath({name: 'customers-id-edit', params: {id: customer.id}})">
            <Pencil aria-hidden="true"/>
            {{ $t('common.actions.edit') }}
          </NuxtLink>
        </Button>
      </PageActions>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{{ $t('users.general_information') }}</CardTitle>
          </CardHeader>
          <dl class="space-y-6">
            <div class="sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="text-sm font-medium leading-6">{{ $t('common.general.name') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">
                <template v-if="customer?.first_name || customer?.last_name">
                  {{ `${customer?.first_name} ${customer?.last_name}` }}
                </template>
                <template v-else>-</template>
              </dd>
            </div>
            <div class="sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="text-sm font-medium leading-6">{{ $t('common.general.email') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">
                <a :href="`mailto:${customer.email}`" class="underline">{{ customer.email || '-' }}</a>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
      <div>

      </div>
    </div>

  </Page>
</template>
