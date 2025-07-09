<script setup lang="ts">
import {ArrowLeft, Dot} from 'lucide-vue-next'

const route = useRoute()
const supabase = useSupabaseClient()

const {data: memory, error} = await useAsyncData('memory', async () => {
  const {data, error} = await supabase.from('memories')
      .select('*, memory_sections(*)')
      .eq('collection_id', route.params.collectionId)
      .eq('slug', route.params.slug)
      .single()
  if (error) throw error
  return data
})

useHead({
  title: memory.value.title
})

const orderedSections = computed(() => {
  if (!memory.value || !memory.value.sections) {
    return []
  }
  return memory.value.sections.sort((a: any, b: any) => a.order_index - b.order_index)
})
</script>

<template>
  <div class="relative h-[200px] flex flex-col items-start justify-between rounded-b-2xl py-4 overflow-hidden">
    <img v-if="memory.cover_image" :src="memory.cover_image" :alt="memory.title" class="absolute inset-0 object-cover">
    <div v-else class="absolute inset-0 bg-primary"></div>
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative container">
      <NuxtLink to="/">
        <Button size="sm" class="bg-background/50 backdrop-blur-md">
          <ArrowLeft/>
          {{ $t('common.actions.back_to_item', { item: lowercase($t('home.timeline')) }) }}
        </Button>
      </NuxtLink>
    </div>
    <div class="relative container text-white">
      <h1>{{ memory.title }}</h1>
      <div class="flex items-center font-medium">
        {{ memory.location }}
        <Dot/>
        <span class="text-sm">{{ `${$dayjs(memory.date_from).format('D MMMM YYYY')}${memory.date_to ? ` - ${$dayjs(memory.date_from).format('D MMMM YYYY')}`: ''} `}}</span>
      </div>
    </div>
  </div>

  <div class="container">
    <p class="font-cursive text-lg/8 my-6">{{ memory.content }}</p>

    <div class="space-y-6">
      <section v-if="orderedSections.length" v-for="section in orderedSections">
        <p class="font-cursive text-lg/8">
          {{ section.content }}
        </p>
      </section>
    </div>

  </div>

</template>

<style scoped>

</style>