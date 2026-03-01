<script setup lang="ts">
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <dd :class="cn('mt-1 text-sm leading-6 text-muted-foreground @sm:col-span-2 @sm:mt-0', props.class)">
    <slot/>
  </dd>
</template>

<style scoped>

</style>