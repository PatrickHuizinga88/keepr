<script setup lang="ts">
import {Sidebar} from "~/components/ui/sidebar";
import {Toaster} from "~/components/ui/toast";

const toastStore = useToastStore()
const userStore = useUserStore()

await userStore.fetchUserRole()
</script>

<template>

  <NuxtLoadingIndicator color="var(--primary)"/>

  <Sidebar ref="sidebar"/>

  <div class="lg:pl-64 overflow-x-hidden">
    <div class="container">
      <div class="pb-6">
        <slot/>
      </div>
    </div>
  </div>

  <Toaster :toasts="toastStore.toasts"/>

</template>