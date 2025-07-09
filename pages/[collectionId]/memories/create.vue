<script setup lang="ts">
const {t} = useI18n()

useHead({
  title: t('common.actions.add_item', { item: lowercase(t('memories.memories', 1)) }),
})
</script>

<template>
  <div class="container">
    <h1 class="my-8">{{ $t('common.actions.add_item', { item: lowercase($t('memories.memories', 1)) }) }}</h1>
    <FormMemory/>
  </div>
</template>

<style scoped>

</style>