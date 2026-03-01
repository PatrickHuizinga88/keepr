<script setup lang="ts">
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <dt :class="cn('text-sm font-medium leading-6', props.class)">
    <slot/>
  </dt>
</template>

<style scoped>

</style>