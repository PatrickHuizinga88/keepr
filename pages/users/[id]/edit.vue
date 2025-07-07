<script setup lang="ts">
import {Page} from "../../../components/ui/page";
import type {Database} from "~/types/database.types";

definePageMeta({
  middleware: 'is-admin'
})

const supabase = useSupabaseClient<Database>()
const toastStore = useToastStore()
const {t} = useI18n()

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
  title: t('common.actions.edit_item', {item: `${user.value?.first_name} ${user.value?.last_name}`}),
})
</script>

<template>
  <Page :title="$t('common.actions.edit_item', {item: `${user.first_name} ${user.last_name}`})">
    <FormUser v-if="user" :user="user" />
    <p v-else>{{ $t('not_found', {item: $t('users.users')}) }}</p>
  </Page>
</template>
