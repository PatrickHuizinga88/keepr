<script setup lang="ts">
import { LoaderCircle, Image } from "lucide-vue-next";

const supabase = useSupabaseClient();

const props = defineProps<{
  modelValue: string | null;
  collectionId: string | number;
  filePath?: string;
  accept:
    | ("image/*" | "image/svg+xml" | "image/png" | "image/jpg" | "image/jpeg")
    | Array<"image/svg+xml" | "image/png" | "image/jpg" | "image/jpeg">;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const isLoading = ref(false);
const previewUrl = ref<string | null>(props.modelValue);

const onDrop = async (e: DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  await uploadFile(files[0]);
};

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  await uploadFile(files[0]);
};

const uploadFile = async (file: File) => {
  isLoading.value = true;

  const fileName = props.filePath || file.name;
  const { error } = await supabase.storage
    .from("media")
    .upload(`${props.collectionId}/${fileName}`, file, {
      upsert: true,
    });
  if (error) {
    isLoading.value = false;
    console.error("Upload error:", error);
    return;
  }
  const { data, error: signedUrlError } = await supabase.storage
    .from("media")
    .createSignedUrl(`${props.collectionId}/${fileName}`, 3600);
  if (signedUrlError) {
    isLoading.value = false;
    console.error("Signed URL error:", signedUrlError);
    return;
  }
  previewUrl.value = data.signedUrl;
  emit("update:modelValue", `${props.collectionId}/${fileName}`);
  isLoading.value = false;
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    (fileInput.value as HTMLInputElement).click();
  }
};

const fileInput = ref<HTMLInputElement | null>(null);

const acceptedFileTypes = Array.isArray(props.accept) ? props.accept.join(",") : props.accept;
</script>

<template>
  <div
    class="relative border rounded-md p-2 flex flex-col items-center justify-center min-h-32 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
    tabindex="0"
    role="button"
    aria-label="Upload image"
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
      aria-label="Select image to upload"
    />
    <div v-if="isLoading" class="flex flex-col items-center">
      <LoaderCircle class="size-5 text-primary animate-spin" />
      <span class="sr-only">Uploading...</span>
    </div>
    <div v-else>
      <img
        v-if="previewUrl"
        :src="previewUrl"
        :alt="props.filePath"
        class="h-32 rounded-md object-contain"
      />
      <div v-else class="flex flex-col items-center text-sm my-2">
        <Image class="size-10 text-muted-foreground/50 mb-3" />
        <span class="font-medium">Click to upload or drag and drop</span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
