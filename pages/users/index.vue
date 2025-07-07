<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next'
import {Page, PageActions, PageHeader} from "~/components/ui/page";
import {SkeletonTable} from "~/components/ui/skeleton";
import {EmptyState} from "~/components/ui/empty-state";
import type {Database} from "~/types/database.types";

definePageMeta({
  middleware: 'is-admin'
})

const supabase = useSupabaseClient<Database>()
const toastStore = useToastStore()
const {t} = useI18n()
const localePath = useLocalePath()

useHead({
  title: t("users.users", 2),
})

const itemsPerPage = 10

const dialogOpen = ref(false)
const searchQuery = ref('')
const startRange = ref(0)
const endRange = ref(8)

const nextPage = () => {
  startRange.value = endRange.value + 1
  endRange.value += itemsPerPage
}

const previousPage = () => {
  startRange.value -= itemsPerPage
  endRange.value -= itemsPerPage
}

const currentPage = computed(() => Math.ceil(endRange.value / itemsPerPage))
const totalPages = computed(() => Math.ceil((users.value?.count ?? 0) / itemsPerPage))

const { data: users, status, refresh } = await useLazyAsyncData('userProfiles', async () => {
  try {
    const { data: profiles, count, error: profilesError } = await supabase.from('profiles')
      .select('user_id,first_name,last_name', {count: 'exact'})
      .range(startRange.value, endRange.value)
    if (profilesError) throw profilesError

    const { data: roles, error: rolesError } = await supabase.from('user_roles')
      .select('user_id,role')
      .range(startRange.value, endRange.value)
    if (rolesError) throw rolesError

    const transformedProfiles = profiles.map((profile: any) => {
      const role = roles.find((role: any) => role.user_id === profile.user_id)
      return {
        ...profile,
        role: role ? role.role : null
      }
    })

    return {
      data: transformedProfiles,
      count
    }
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'retrieve',
      item: t('users.users', 2)
    })
    console.error(error)
  }
}, {
  watch: [startRange, searchQuery]
})

const formSubmitted = () => {
  dialogOpen.value = false
  refresh()
}
</script>

<template>
  <Page :title="$t('users.users', 2)">
    <PageHeader class="justify-end">
      <PageActions>
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button size="sm">
              <UserPlus/>
              {{ capitalizeSentence($t('common.actions.invite_item', {item: $t('users.users')})) }}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{{ capitalizeSentence($t('common.actions.invite_item', {item: $t('users.users')})) }}</DialogTitle>
              <DialogDescription>{{ $t('users.invite_description') }}</DialogDescription>
            </DialogHeader>
            <FormUser invite @submit="formSubmitted"/>
          </DialogContent>
        </Dialog>
      </PageActions>
    </PageHeader>
    
    <div v-if="users?.data.length" class="flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow-md shadow-black/5 border border-border sm:rounded-2xl">
            <table class="min-w-full divide-y divide-border">
              <thead class="bg-muted">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">{{ $t('users.name') }}</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">{{ $t('users.role') }}</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">{{ $t('common.actions.edit') }}</span>
                </th>
              </tr>
              </thead>
              <tbody class="divide-y divide-border bg-card">
              <tr v-for="user in users.data" :key="user.user_id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                  <NuxtLinkLocale :to="localePath({name: 'users-id', params: {id: user.user_id}})">
                    <template v-if="user.first_name || user.last_name">
                      {{ user.first_name }} {{ user.last_name }}
                    </template>
                    <template v-else>-</template>
                  </NuxtLinkLocale>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{{ user.role ? $t(`users.roles.${user.role}`) : '-' }}</td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <NuxtLinkLocale :to="localePath({name: 'users-id-edit', params: {id: user.user_id}})" class="text-primary hover:underline">
                    {{ $t('common.actions.edit') }}<span class="sr-only">, {{ user.first_name }} {{ user.last_name }}</span>
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
        <Pagination :total="users.count || 0" :items-per-page="itemsPerPage" show-edges>
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
