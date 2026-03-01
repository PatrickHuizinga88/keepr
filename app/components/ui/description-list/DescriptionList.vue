<script setup lang="ts">
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <dl :class="cn('@container space-y-6', props.class)">
    <slot/>
  </dl>
</template>

<style scoped>

</style>