<script setup lang="ts">
import {UserCircle} from 'lucide-vue-next'
import Toaster from "~/components/ui/toast/Toaster.vue";
import {APP_NAME as appName} from "~/constants";
import {useToastStore} from "~/stores/toastStore";

const toastStore = useToastStore()
</script>

<template>
  <NuxtLoadingIndicator color="var(--primary)"/>
  <header class="bg-background">
    <div class="container">
      <nav class="h-16 flex justify-between items-center gap-8">
        <NuxtLinkLocale to="/">
          <img src="/logo.svg" :alt="appName" class="h-9">
        </NuxtLinkLocale>
        <Button variant="ghost" size="icon" as-child>
          <NuxtLinkLocale to="account">
            <UserCircle/>
          </NuxtLinkLocale>
        </Button>
      </nav>
    </div>
  </header>

  <div class="pb-6 sm:pb-10">
    <slot/>
  </div>

  <Toaster :toasts="toastStore.toasts"/>

</template>