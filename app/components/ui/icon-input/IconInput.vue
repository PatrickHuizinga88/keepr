<script setup lang="ts">
import {useVModel} from "@vueuse/core";
import type {HTMLAttributes} from "vue";

const props = defineProps<{
  iconPosition: 'left' | 'right'
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <div class="relative rounded-md shadow-sm">
    <div v-if="iconPosition === 'left'" class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <slot aria-hidden="true"/>
    </div>
    <Input
        :value="modelValue"
        :class="cn(iconPosition === 'left' ? 'pl-10 pr-3' : 'pr-10 pl-3', props.class)"
        v-bind="$attrs"/>
    <div v-if="iconPosition === 'right'" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <slot aria-hidden="true"/>
    </div>
  </div>
</template>