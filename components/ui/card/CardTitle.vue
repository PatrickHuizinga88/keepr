<script setup lang="ts">
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <h3 :class="cn('text-base font-medium mb-0.5', props.class)">
    <slot/>
  </h3>
</template>

<style scoped>

</style>