<script setup lang="ts">
import Navigation from "../../Navigation.vue";
</script>

<template>
  <div id="sidebar" class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-muted">
    <div class="flex grow flex-col overflow-y-auto border-r border-border px-6 pb-4">
      <div class="flex shrink-0 items-center pt-6 pb-14">
        <NuxtLinkLocale to="/">
          <img src="/logo.svg" alt="Logo" class="h-10">
        </NuxtLinkLocale>
      </div>

      <Navigation />
    </div>
  </div>
</template>