<script setup lang="ts">
import Toast from "~/components/ui/toast/Toast.vue";

defineProps<{
  toasts: {
    id: string,
    type: 'success' | 'destructive',
    title: string,
    description?: string
  }[]
}>()
</script>

<template>
  <div aria-live="assertive" class="pointer-events-none fixed inset-0 flex items-end py-6 z-20">
    <div class="px-4 w-full">
      <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
        <transition-group
          enter-active-class="transform linear duration-200 transition"
          enter-from-class="translate-y-2 sm:translate-y-[100px] sm:translate-x-2"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="translate-x-[400px]">
          <Toast
            v-for="toast in toasts"
            :type="toast.type"
            :title="toast.title"
            :description="toast.description"
            :key="toast.id"
          />
          <!--          <Notification-->
          <!--              v-for="(toast, index) in notifications"-->
          <!--              :type="toast.type"-->
          <!--              :title="toast.title"-->
          <!--              :description="toast.description"-->
          <!--              :key="index"-->
          <!--              :style="`scale: ${1 - index * 0.1}; z-index: ${notifications.length - index}`"-->
          <!--          />-->
        </transition-group>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>