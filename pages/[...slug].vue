<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: '404'
})
</script>

<template>
  <section id="404" class="relative">
    <div class="container">
      <div class="grid min-h-screen place-items-center">
        <div class="relative text-center">
          <span class="text-[10rem] sm:text-[12rem] text-foreground/20">404</span>
          <div class="-mt-10">
            <h1 class="text-balance text-5xl font-semibold tracking-tight sm:text-5xl">{{ $t('404.page_not_found.title') }}</h1>
            <p class="mt-4 text-pretty text-lg font-medium text-muted-foreground">{{ $t('404.page_not_found.description') }}</p>
            <div class="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-x-6 gap-y-4">
              <Button as-child>
                <NuxtLinkLocale to="/">{{ $t('404.back_to_home') }}</NuxtLinkLocale>
              </Button>
              <Button variant="outline" as-child>
                <NuxtLinkLocale to="support">{{ $t('404.contact_us') }}</NuxtLinkLocale>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>