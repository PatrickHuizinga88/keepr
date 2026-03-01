<script setup lang="ts">
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex items-start justify-between gap-4 pb-5', props.class)">
    <slot/>
  </div>
</template>

<style scoped>

</style>