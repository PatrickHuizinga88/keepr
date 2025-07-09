<script setup lang="ts">
import type {Database} from "~/types/database.types";

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toastStore = useToastStore()
const {t, locale} = useI18n()
const localePath = useLocalePath()
const dayjs = useDayjs()

useHead({
  title: t("common.navigation.home"),
})

const {data: profile} = await useAsyncData('profile', async () => {
  if (!user.value) return
  const {data, error} = await supabase.from('profiles')
      .select('name')
      .eq('user_id', user.value.id)
      .single()
  if (error) throw error
  return data
})

const {data: collection} = await useAsyncData('collection', async () => {
  if (!user.value) return

  const {data: collectionMember, error: collectionMemberError} = await supabase.from('collection_members')
      .select('collection_id')
      .eq('user_id', user.value.id)
      .single()
  if (collectionMemberError) throw collectionMemberError

  const {data: collection, error: collectionError} = await supabase.from('collections')
      .select('*, memories(*)')
      .eq('id', collectionMember.collection_id)
      .single()
  if (collectionError) throw collectionError
  return collection
})
</script>

<template>
  <div class="container">
    <h1>{{`${$t('home.hi')} ${profile?.name || 'common.general.guest'}`}}</h1>
    <ul>
      <li v-for="memory in collection.memories" :key="memory.id">
        <NuxtLinkLocale :to="localePath({name: 'collectionId-memories-slug', params: { collectionId: collection.id, slug: memory.slug }})">
          {{ memory.title }}
        </NuxtLinkLocale>
      </li>
    </ul>

    <NuxtLinkLocale :to="localePath({name: 'collectionId-memories-create', params: { collectionId: collection.id }})" class="border p-4">
      +
    </NuxtLinkLocale>
  </div>
</template>
