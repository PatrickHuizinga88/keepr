<script setup lang="ts">
import Header from "~/components/Header.vue";

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <Header :pageTitle="title" :pageDescription="description"/>
  <main>
    <slot/>
  </main>
</template>