<script setup lang="ts">
import {ArrowLeft, Dot} from 'lucide-vue-next'

const route = useRoute()
const supabase = useSupabaseClient()

const {data: memory} = await useAsyncData('memory', async () => {
  const {data, error} = await supabase.from('memories')
      .select(`
      *,
      memory_sections(
      *,
      media (*)
      )`)
      .eq('collection_id', route.params.collectionId)
      .eq('slug', route.params.slug)
      .single()
  if (error) throw error
  return data
})

useHead({
  title: memory.value.title
})

const sectionImages = ref({})

const {data: coverImage} = await useAsyncData('coverImage', async () => {
  try {
    const {data, error} = await supabase.storage.from('media').download(memory.value.cover_image)
    if (error) throw error
    return URL.createObjectURL(data)
  } catch (error) {
    console.error('Error downloading cover image:', error)
    return null
  }
})

const imageSrc = async (path: string) => {
  try {
    const {data, error} = await supabase.storage.from('media').download(path)
    if (error) throw error
    return URL.createObjectURL(data)
  } catch (error) {
    console.error('Error downloading image:', error)
    return null
  }
}

const orderedSections = computed(() => {
  if (!memory.value || !memory.value.memory_sections) {
    return []
  }
  return memory.value.memory_sections.sort((a: any, b: any) => a.order_index - b.order_index)
})

const showLightbox = ref(false)
const lightboxImages = ref<string[]>([])
const selectedImage = ref<string | undefined>(undefined)

const openImage = (imageId: string, section: any) => {
  lightboxImages.value = section.media.map((img: any) => sectionImages.value[img.id])
  selectedImage.value = sectionImages.value[imageId]
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
}

onMounted(async () => {
  if (orderedSections.value.length) {
    for (const section of orderedSections.value) {
      if (section.media?.length) {
        for (const image of section.media) {
          if (image.url) {
            sectionImages.value[image.id] = await imageSrc(image.url)
          }
        }
      }
    }
  }
})
</script>

<template>
  <div class="relative h-[200px] flex flex-col items-start justify-between rounded-b-2xl py-4 overflow-hidden">
    <img v-if="coverImage" :src="coverImage" :alt="memory.title"
         class="absolute inset-0 object-cover object-center w-full">
    <div v-else class="absolute inset-0 bg-primary"></div>
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative container max-w-[900px]">
      <NuxtLink to="/">
        <Button size="sm" class="bg-background/50 backdrop-blur-md">
          <ArrowLeft/>
          {{ $t('common.actions.back_to_item', {item: lowercase($t('home.timeline'))}) }}
        </Button>
      </NuxtLink>
    </div>
    <div class="relative container max-w-[900px] text-white">
      <h1 class="mb-1">{{ memory.title }}</h1>
      <div class="flex items-center font-medium">
        {{ memory.location }}
        <Dot v-if="memory.location"/>
        <span
            class="text-sm">{{
            `${$dayjs(memory.date_from).format('D MMMM YYYY')}${memory.date_to ? ` - ${$dayjs(memory.date_to).format('D MMMM YYYY')}` : ''} `
          }}</span>
      </div>
    </div>
  </div>

  <div class="container max-w-[900px]">
    <p class="font-cursive text-lg/8 my-6">{{ memory.content }}</p>

    <section v-if="orderedSections.length" v-for="section in orderedSections" class="space-y-6">
      <div v-if="section.media.length" class="flex gap-1 bg-white p-1 rounded-xl">
        <div v-for="image in section.media" :key="image.id" @click="openImage(image.id, section)">
          <img :src="sectionImages[image.id]" :alt="image.url" class="w-full h-full object-cover rounded-lg">
        </div>
      </div>
      <p class="font-cursive text-lg/8">
        {{ section.content }}
      </p>
    </section>
  </div>

  <Lightbox
      v-if="showLightbox"
      :images="lightboxImages"
      :selectedImage="selectedImage"
      @close="closeLightbox"
  />

</template>

<style scoped>

</style>