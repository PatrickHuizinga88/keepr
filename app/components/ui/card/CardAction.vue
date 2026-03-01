<script setup lang="ts">
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('-mt-1.5 -mr-3', props.class)">
    <slot/>
  </div>
</template>

<style scoped>

</style>