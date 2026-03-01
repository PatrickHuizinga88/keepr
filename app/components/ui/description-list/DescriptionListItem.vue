<script setup lang="ts">
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('@sm:grid @sm:grid-cols-3 @sm:gap-4', props.class)">
    <slot/>
  </div>
</template>

<style scoped>

</style>