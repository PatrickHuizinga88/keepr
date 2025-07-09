<script setup lang="ts">
import type {HTMLAttributes} from "vue";
import {useVModel} from "@vueuse/core";
import {Eye, EyeOff} from 'lucide-vue-next'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  id?: string
  class?: HTMLAttributes['class']
}>()

const showPassword = ref(false)

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <div class="relative rounded-md">
    <Input
        v-model="modelValue"
        :id="props.id"
        :class="cn('pr-10', props.class)"
        :type="!showPassword ? 'password' : 'text'"
        v-bind="$attrs"/>
    <Button @click="showPassword = !showPassword" type="button" variant="ghost" size="icon-sm" :aria-label="$t('authentication.common.toggle_password_visibility')" class="absolute inset-y-0 right-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
      <Eye v-if="!showPassword" class="size-4"/>
      <EyeOff v-else class="size-4"/>
    </Button>
  </div>
</template>