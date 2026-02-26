<script setup lang="ts">
import {LoaderCircle, Image} from "lucide-vue-next";

const supabase = useSupabaseClient()

const props = defineProps<{
  modelValue: string[] | null
  collectionId: string | number
  filePath?: string
  accept: ('image/*' | 'image/svg+xml' | 'image/png' | 'image/jpg' | 'image/jpeg') | Array<'image/svg+xml' | 'image/png' | 'image/jpg' | 'image/jpeg'>
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[] | null): void
}>()

const isLoading = ref(false)
const previewUrls = ref<string[]>(props.modelValue ? [...props.modelValue] : [])

const onDrop = async (e: DragEvent) => {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  await uploadFiles(Array.from(files))
}

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  await uploadFiles(Array.from(files))
}

const uploadFiles = async (files: File[]) => {
  isLoading.value = true
  const newUrls: string[] = []
  const fileNames: string[] = []
  for (const file of files) {
    const fileName = file.name
    const {error} = await supabase.storage.from('media').upload(`${props.collectionId}/${fileName}`, file, {
      upsert: true
    })
    if (error) {
      console.error('Upload error:', error)
      continue
    }
    const {
      data,
      error: signedUrlError
    } = await supabase.storage.from('media').createSignedUrl(`${props.collectionId}/${fileName}`, 3600)
    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError)
      continue
    }
    newUrls.push(data.signedUrl)
    fileNames.push(fileName)
  }
  previewUrls.value = [...previewUrls.value, ...newUrls]
  console.log(fileNames)
  emit('update:modelValue', fileNames)
  isLoading.value = false
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    (fileInput.value as HTMLInputElement).click()
  }
}

const loadPreviewUrls = async () => {
  if (!props.modelValue || props.modelValue.length === 0) {
    previewUrls.value = []
    return
  }
  let urls: string[] = []
  for (const item of props.modelValue) {
    const {data, error} = await supabase.storage.from('media').createSignedUrl(`${props.collectionId}/${item}`, 3600)
    if (!error && data?.signedUrl) {
      urls.push(data.signedUrl)
    }
  }
  previewUrls.value = urls
}

watch(() => props.modelValue, async (newVal) => {
  await loadPreviewUrls()
}, {immediate: true})

const fileInput = ref<HTMLInputElement | null>(null)

const acceptedFileTypes = Array.isArray(props.accept) ? props.accept.join(',') : props.accept
</script>

<template>
  <div
      class="relative border rounded-3xl p-2 flex flex-col items-center justify-center min-h-32 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
      tabindex="0"
      role="button"
      aria-label="Upload images"
      @drop="onDrop"
      @dragover.prevent
      @keydown="onKeyDown"
      @click="() => fileInput?.click()"
  >
    <input
        ref="fileInput"
        type="file"
        :accept="acceptedFileTypes"
        class="hidden"
        @change="onSelectFile"
        aria-label="Select images to upload"
        multiple
    />
    <div v-if="isLoading" class="flex flex-col items-center">
      <LoaderCircle class="size-5 text-primary animate-spin"/>
      <span class="sr-only">Uploading...</span>
    </div>
    <div v-else>
      <div v-if="previewUrls.length > 0" class="flex flex-wrap gap-2">
        <img
            v-for="(url, idx) in previewUrls"
            :key="idx"
            :src="url"
            :alt="props.filePath"
            class="h-32 rounded-md object-contain"
        />
      </div>
      <div v-else class="flex flex-col items-center text-sm my-2">
        <Image class="size-10 text-muted-foreground/50 mb-3"/>
        <span class="font-medium">Click to upload or drag and drop</span>
      </div>
    </div>
  </div>
</template>