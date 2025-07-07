<script setup lang="ts">
import {PlusCircle} from 'lucide-vue-next'
import type {Database} from "~/types/database.types";
import {Page, PageActions, PageHeader} from "../../components/ui/page";
import {SkeletonTable} from "~/components/ui/skeleton";
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'
import {EmptyState} from "~/components/ui/empty-state";

const supabase = useSupabaseClient<Database>()
const toastStore = useToastStore()
const {t} = useI18n()
const localePath = useLocalePath()

useHead({
  title: t("customers.customers", 2),
})

const itemsPerPage = 10

const searchQuery = ref('')
const startRange = ref(0)
const endRange = ref(itemsPerPage - 1)

const nextPage = () => {
  startRange.value = endRange.value + 1
  endRange.value += itemsPerPage
}

const previousPage = () => {
  startRange.value -= itemsPerPage
  endRange.value -= itemsPerPage
}

const currentPage = computed(() => Math.ceil(endRange.value / itemsPerPage))
const totalPages = computed(() => Math.ceil((customers.value?.count ?? 0) / itemsPerPage))

const {data: customers, status} = await useLazyAsyncData(async () => {
  try {
    const {count, data, error} = await supabase
        .from('customers')
        .select('*', {count: 'exact'})
        .order('created_at', {ascending: false})
        .ilike('last_name', `%${searchQuery.value}%`)
        .range(startRange.value, endRange.value)
    if (error) throw error
    return {
      data,
      count
    }
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'retrieve',
      item: t('customers.customers', 2)
    })
    console.error(error)
  }
}, {
  watch: [startRange, searchQuery]
})
</script>

<template>
  <Page :title="$t('customers.customers', 2)">
    <PageHeader>
      <Input v-model="searchQuery" :placeholder="$t('common.general.search')" class="h-9 sm:max-w-[250px]"/>
      <PageActions>
        <Button size="sm" as-child>
          <NuxtLinkLocale to="customers-create">
            <PlusCircle/>
            {{ capitalizeSentence($t('common.actions.add_item', {item: $t('customers.customers')})) }}
          </NuxtLinkLocale>
        </Button>
      </PageActions>
    </PageHeader>

    <div v-if="customers?.data.length" class="flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow-md shadow-black/5 border border-border sm:rounded-2xl">
            <table class="min-w-full divide-y divide-border">
              <thead class="bg-muted">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">
                  {{ $t('common.general.name') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">{{
                    $t('common.general.email')
                  }}
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">{{ $t('common.actions.actions') }}</span>
                </th>
              </tr>
              </thead>
              <tbody class="divide-y divide-border bg-card">
              <tr v-for="customer in customers.data" :key="customer.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                  <NuxtLinkLocale :to="localePath({name: 'customers-id', params: {id: customer.id}})">
                    <template v-if="customer.first_name || customer.last_name">
                      {{ customer.first_name + ' ' + customer.last_name }}
                    </template>
                    <template v-else>-</template>
                  </NuxtLinkLocale>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                  <a :href="`mailto:${customer.email}`">{{ customer.email || '-' }}</a>
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <NuxtLinkLocale :to="localePath({name: 'customers-id-edit', params: {id: customer.id}})" class="text-primary hover:underline">
                    {{ $t('common.actions.edit') }}<span
                      class="sr-only">, {{ customer.first_name + ' ' + customer.last_name }}</span>
                  </NuxtLinkLocale>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="flex justify-end items-center gap-x-6 mt-4">
        <div class="text-sm text-muted-foreground">
          {{ `${$t('common.pagination.page')} ${currentPage} ${$t('common.pagination.of')} ${totalPages}` }}
        </div>
        <Pagination :total="customers.count || 0" :items-per-page="itemsPerPage" show-edges>
          <PaginationList class="flex items-center gap-2">
            <PaginationPrev @click="previousPage"/>
            <PaginationNext @click="nextPage"/>
          </PaginationList>
        </Pagination>
      </div>
    </div>
    <SkeletonTable v-else-if="status === 'pending'" :columns="3"/>
    <EmptyState v-else :items="$t('users.users', 2)"/>
  </Page>
</template>
