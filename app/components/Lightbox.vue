<script setup lang="ts">
import {X} from 'lucide-vue-next';

const props = defineProps<{
  images: string[];
  selectedImage?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentImage = ref(props.selectedImage || props.images[0]);

watch(() => props.selectedImage, (val) => {
  if (val) currentImage.value = val;
});

const selectImage = (img: string) => {
  currentImage.value = img;
}

const closeLightbox = () => {
  emit('close');
}
</script>

<template>
  <div class="fixed inset-0 bg-black/75 backdrop-blur flex items-center justify-center z-50 starting:opacity-0 transition-all duration-300">
    <div class="flex flex-col justify-between p-4 h-full w-full items-center" @click.self="closeLightbox">
      <div></div>
      <Button
          class="absolute top-2 right-2 bg-background/50 hover:bg-background"
          size="icon"
          variant="ghost"
          @click="closeLightbox"
          aria-label="Close"
      >
        <X/>
      </Button>

      <div class="flex-1 grid place-items-center" @click.self="closeLightbox">
        <img
            :src="currentImage"
            alt="Selected"
            class="max-h-[60vh] object-contain rounded-3xl mb-4"
        />
      </div>

      <div class="flex gap-2 overflow-x-auto w-full py-2">
        <img
          v-for="img in props.images"
          :key="img"
          :src="img"
          alt="Thumbnail"
          class="h-20 object-cover rounded-lg cursor-pointer transition-all"
          :class="img === currentImage ? 'border-2 border-primary' : ''"
          @click="selectImage(img)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No extra styles needed, Tailwind covers all */
</style>