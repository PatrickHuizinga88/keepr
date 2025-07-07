<script setup lang="ts">
defineProps<{
  columns: number
}>()
</script>

<template>
  <div class="flow-root" aria-label="status">
    <div class="-mx-6 -my-2 overflow-x-auto lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden shadow-md shadow-black/5 border border-border sm:rounded-2xl">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 sm:pl-6">
                <Skeleton class="w-20 h-4 bg-muted-foreground/10"/>
              </th>
              <th v-for="col in columns - 1" scope="col" class="px-3 py-3.5">
                <Skeleton class="w-20 h-4 bg-muted-foreground/10"/>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-border bg-card">
            <tr v-for="row in 8">
              <td class="py-4 pl-4 pr-3 sm:pl-6">
                <Skeleton class="w-20 h-4"/>
              </td>
              <td v-for="col in columns - 1" class="px-3 py-4">
                <Skeleton class="w-20 h-4"/>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>