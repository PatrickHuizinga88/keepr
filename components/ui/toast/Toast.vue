<script setup lang="ts">
import { CheckCircle, CircleAlert, X } from "lucide-vue-next";

const props = defineProps<{
  type: 'success' | 'destructive'
  title: string
  description?: string
}>()

const show = ref(true)

const typeClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-success/10 text-success'
    case 'destructive':
      return 'bg-destructive/10 text-destructive'
  }
})
</script>

<template>
  <div v-if="show" class="group relative pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-background border border-border shadow-lg">
    <div class="p-4 pt-2">
      <div class="flex items-start">
        <div v-if="type" class="lex-shrink-0 mr-3">
          <div :class="cn('flex items-center p-2 rounded-full', typeClass)">
            <CheckCircle v-if="type === 'success'" class="size-4" aria-hidden="true" />
            <CircleAlert v-else-if="type === 'destructive'" class="size-4" aria-hidden="true" />
          </div>
        </div>
        <div class="w-0 flex-1 pt-1.5">
          <p class="text-sm font-medium">{{ title }}</p>
          <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
        </div>
        <Button variant="ghost" @click="show = false" :aria-label="$t('common.toasts.close_notification')" class="opacity-0 absolute right-2 top-2 p-1 h-auto text-muted-foreground group-hover:opacity-100">
          <X class="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>