<script setup lang="ts">
import {Space} from "lucide-vue-next";

const props = defineProps<{
  items: string
}>()
</script>

<template>
  <div class="flex flex-col justify-center items-center w-full h-48 text-sm text-muted-foreground border rounded-2xl">
    <Space class="size-12 mb-4"/>
    <span class="font-semibold text-foreground text-base mb-1">{{ $t('common.general.empty_state.title') }}</span>
    {{ $t('common.general.empty_state.description', {items: lowercase(props.items)}) }}
  </div>
</template>

<style scoped>

</style>