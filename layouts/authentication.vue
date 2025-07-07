<script setup lang="ts">
import {Toaster} from "~/components/ui/toast";
import {APP_NAME} from "~/constants";

defineProps<{
  title?: string
  description?: string
}>()

const toastStore = useToastStore()
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center sm:bg-muted/50 py-12">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm text-center px-6 sm:px-0 mb-4 sm:mb-6 md:mb-8 -mt-20 sm:mt-0">
      <img src="/logo.svg" :alt="APP_NAME"
           class="mx-auto h-12 w-auto starting:opacity-0 starting:translate-y-2 transition-all duration-500">
      <div class="text-center mt-10 starting:opacity-0 starting:translate-y-2 transition-all duration-500 delay-100">
        <h1 v-if="title" class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p v-if="description" class="text-sm text-muted-foreground mt-4">{{ description }}</p>
      </div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-[440px]">
      <div
          class="bg-background sm:bg-card sm:shadow-sm sm:rounded-xl p-6 starting:opacity-0 starting:translate-y-2 transition-all duration-500 delay-200">
        <slot/>
      </div>
    </div>
    <div
        class="sm:mt-6 md:mt-10 text-center text-sm text-muted-foreground starting:opacity-0 starting:translate-y-2 transition-all duration-500 delay-300">
      <slot name="footer"/>
    </div>
  </div>

  <Toaster :toasts="toastStore.toasts"/>

</template>

<style scoped>
@media (min-width: 640px) {
  .gradient-shadows {
    box-shadow: 32px 64px 128px -48px hsl(var(--primary) / .1),
    -64px -24px 128px -48px color-mix(in lch increasing hue, hsl(var(--primary) / .1) 33%, hsl(var(--accent) / .1)),
    64px -48px 128px -48px color-mix(in lch increasing hue, hsl(var(--primary) / .1) 67%, hsl(var(--accent) / .1));
  }
}
</style>