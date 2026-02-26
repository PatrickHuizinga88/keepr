<script setup lang="ts">
import type {Database} from "~/types/database.types";

const {t} = useI18n()

useHead({
  title: t('common.actions.edit_item', { item: lowercase(t('memories.memories', 1)) }),
})

const supabase = useSupabaseClient<Database>()
const route = useRoute()

const { data: memory } = await useAsyncData('memory', async () => {
  const { data, error } = await supabase.from('memories')
    .select('*, memory_sections(*, media(*))')
    .eq('collection_id', route.params.collectionId)
    .eq('slug', route.params.slug)
    .single()
  if (error) throw error
  return data
})
</script>

<template>
  <div class="container">
    <h1 class="my-8">{{ $t('common.actions.add_item', { item: lowercase($t('memories.memories', 1)) }) }}</h1>
    <FormMemory :memory="memory" :collection-id="route.params.collectionId"/>
  </div>
</template>

<style scoped>

</style>