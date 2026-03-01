<script setup lang="ts">
const { t } = useI18n();

useHead({
  title: t("common.actions.add_item", { item: lowercase(t("memories.memories", 1)) }),
});

const route = useRoute();
</script>

<template>
  <div class="container max-w-5xl">
    <h1 class="my-8">
      {{ $t("common.actions.add_item", { item: lowercase($t("memories.memories", 1)) }) }}
    </h1>
    <FormMemory :collection-id="route.params.collectionId" />
  </div>
</template>

<style scoped></style>
