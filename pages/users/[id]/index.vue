<script setup lang="ts">
import {Trash, Pencil} from 'lucide-vue-next'
import {Card} from "~/components/ui/card";
import type {Database} from "~/types/database.types";
import {Page, PageActions, PageBackButton, PageHeader} from "~/components/ui/page";
import {
  DescriptionList,
  DescriptionListItem,
  DescriptionListTitle,
  DescriptionListValue
} from "~/components/ui/description-list";

definePageMeta({
  middleware: 'is-admin'
})

const supabase = useSupabaseClient<Database>()
const toastStore = useToastStore()
const {t} = useI18n()
const localePath = useLocalePath()

const dialogOpen = ref(false)
const loadingDelete = ref(false)

const {data: user} = await useAsyncData(async () => {
  try {
    const {data: profile, error: profileError} = await supabase.from('profiles')
        .select('*')
        .eq('user_id', useRoute().params.id)
        .single()
    if (profileError) throw profileError

    const {data: role, error: roleError} = await supabase.from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .single()
    if (roleError) throw roleError

    const {email} = await $fetch('/api/user', {
      method: 'POST',
      body: {
        id: profile.user_id
      }
    })
    if (!email) throw new Error('Could not find email')

    return {
      ...profile,
      ...role,
      email,
    };
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'retrieve',
      item: t('users.users', 1),
    })
    console.error(error)
  }
})

useHead({
  title: `${user.value?.first_name} ${user.value?.last_name}`,
})

const deleteUser = async () => {
  try {
    loadingDelete.value = true

    await $fetch('/api/delete-user', {
      method: 'POST',
      body: {
        id: user.value.user_id
      }
    })

    toastStore.createToast({
      type: 'success',
      action: 'delete',
      item: `${user.value?.first_name} ${user.value?.last_name}` || t('users.users'),
    })
    navigateTo(localePath('users'))
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'delete',
      item: `${user.value?.first_name} ${user.value?.last_name}` || t('users.users'),
    })
    dialogOpen.value = false
    console.error(error)
  } finally {
    loadingDelete.value = false
  }
}
</script>

<template>
  <Page :title="`${user?.first_name} ${user?.last_name}` || $t('users.users', 1)">
    <PageHeader>
      <PageBackButton to="users"
                      :label="capitalizeSentence($t('common.actions.back_to_item', {item: $t('users.users', 2)}))"/>
      <PageActions>
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button variant="outline" size="sm">
              <Trash class="size-4" aria-hidden="true"/>
              {{ $t('common.actions.delete') }}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{{
                  $t('common.actions.delete_item', {item: `${user.first_name} ${user.last_name}` || $t('users.users', 1)})
                }}
              </DialogTitle>
              <DialogDescription>
                {{ $t('common.actions.delete_confirmation', {item: lowercase($t('users.users', 1))}) }}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" @click="dialogOpen = false">
                {{ $t('common.actions.cancel') }}
              </Button>
              <Button variant="destructive" @click="deleteUser">
                {{ $t('common.actions.delete') }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button size="sm" as-child>
          <NuxtLinkLocale :to="localePath({name: 'users-id-edit', params: {id: user.user_id}})">
            <Pencil class="size-4" aria-hidden="true"/>
            {{ $t('common.actions.edit') }}
          </NuxtLinkLocale>
        </Button>
      </PageActions>
    </PageHeader>

    <div v-if="user" class="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
      <div class="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle class="text-xl font-semibold">{{ $t('account.profile.profile_information') }}</CardTitle>
          </CardHeader>
          <DescriptionList>
            <DescriptionListItem>
              <DescriptionListTitle>{{ $t('users.name') }}</DescriptionListTitle>
              <DescriptionListValue>
                <template v-if="user.first_name || user.last_name">
                  {{ user.first_name }} {{ user.last_name }}
                </template>
                <template v-else>-</template>
              </DescriptionListValue>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTitle>{{ $t('common.general.email') }}</DescriptionListTitle>
              <DescriptionListValue>
                <a :href="`mailto:${user.email}`" class="underline">
                  {{ user.email || '-' }}
                </a>
              </DescriptionListValue>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTitle>{{ $t('users.role') }}</DescriptionListTitle>
              <DescriptionListValue>
                {{ user.role ? $t(`users.roles.${user.role}`) : '-' }}
              </DescriptionListValue>
            </DescriptionListItem>
          </DescriptionList>
        </Card>
      </div>
    </div>
  </Page>
</template>
