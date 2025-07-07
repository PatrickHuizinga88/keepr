<script setup lang="ts">
import { ArrowUp, ArrowDown } from 'lucide-vue-next'

defineProps<{
  title: string
  stat?: string | number
  difference?: number
  subtitle?: string
}>()
</script>

<template>
    <div class="bg-card border rounded-2xl shadow shadow-black/5 p-6">
        <h3 class="h4 mb-4">
          {{ title }}
        </h3>
        <div class="flex items-end">
          <div class="mt-4">
            <div class="flex items-center">
              <span class="h2">
                {{ stat || '-' }}
              </span>
              <div v-if="difference" :class="[difference > 0 ? 'text-success' : 'text-destructive', 'inline-flex items-center text-xs font-medium ml-2.5']">
                <div v-if="difference > 0" class="bg-success/15 text-success inline-flex justify-center rounded-full size-4 mr-1">
                  <ArrowUp class="size-2.5 self-center text-success" aria-hidden="true" />
                  <span class="sr-only">An increase of</span>
                </div>
                <div v-else class="bg-destructive/15 text-destructive inline-flex justify-center rounded-full size-4 mr-1">
                  <ArrowDown class="size-2.5 self-center text-destructive" aria-hidden="true" />
                  <span class="sr-only">A decrease of</span>
                </div>
                {{ difference }}%
              </div> 
            </div>
            <span v-if="subtitle" class="text-sm text-muted-foreground">
              {{ subtitle }}
            </span>
          </div>
        </div>
      </div>
</template>