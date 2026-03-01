<script setup lang="ts">
import { CloudUpload, X } from "lucide-vue-next";

interface FileWithPreview extends File {
  preview: string;
}

const props = defineProps({
  multiple: Boolean,
  modelValue: {
    type: Array as () => FileWithPreview[],
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const files = ref<FileWithPreview[]>(props.modelValue);
const isDragOver = ref(false);

const onFileInput = (e: Event) => {
  const inputFiles = (e.target as HTMLInputElement).files;
  if (inputFiles) {
    addFiles(Array.from(inputFiles));
  }
};

const dropHandler = (event: DragEvent) => {
  isDragOver.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const dragOverHandler = () => {
  isDragOver.value = true;
};

const dragLeaveHandler = () => {
  isDragOver.value = false;
};

const addFiles = (newFiles: File[]) => {
  newFiles.forEach((file) => {
    // if (!files.value.some(f => f.name === file.name)) {
    files.value.push(Object.assign(file, { preview: URL.createObjectURL(file) }));
    // }
  });
  emit("update:modelValue", files.value);
};

const removeFile = (file: FileWithPreview) => {
  files.value = files.value.filter((f) => f !== file);
  emit("update:modelValue", files.value);
};

watch(
  () => props.modelValue,
  (newValue) => {
    files.value = newValue;
  },
);
</script>

<template>
  <div
    @drop.prevent="dropHandler"
    @dragover.prevent="dragOverHandler"
    @dragleave.prevent="dragLeaveHandler"
    class="relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer"
    :class="{ 'bg-primary/10 border-primary': isDragOver }"
  >
    <input
      type="file"
      :multiple="props.multiple"
      @change="onFileInput"
      class="absolute inset-0 opacity-0 cursor-pointer"
    />
    <div class="flex flex-col items-center">
      <CloudUpload class="size-8 text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground font-semibold">Klik of sleep om te uploaden</p>
      <p class="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
    </div>
    <!--    <div v-else class="flex flex-col items-center">-->
    <!--      <p class="text-sm text-muted-foreground font-semibold">{{ files.length }} afbeeldingen bijgevoegd</p>-->
    <!--      <p class="text-xs text-muted-foreground">Klik of sleep om te opnieuw te uploaden (PNG, JPG, SVG, WEBP)</p>-->
    <!--    </div>-->
  </div>
  <div v-if="files.length" class="flex flex-wrap gap-2 w-full mt-4!">
    <div v-for="file in files" :key="file.name" class="relative h-16 w-auto aspect-square">
      <img :src="file.preview" :alt="file.name" class="w-full h-full object-cover rounded-lg" />
      <button
        @click="removeFile(file)"
        class="absolute top-1 right-1 bg-foreground/50 rounded-full p-1"
      >
        <X class="size-4 text-background" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>
