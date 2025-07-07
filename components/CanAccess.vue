<script setup lang="ts">
defineProps<{
  allow: string | string[];
}>();

const userStore = useUserStore();
</script>

<template>
  <slot v-if="userStore.hasRole(allow)" />
</template>