<script setup lang="ts">
import { Settings, LogOut } from 'lucide-vue-next'
import Toaster from "~/components/ui/toast/Toaster.vue";
import {APP_NAME} from "~/constants";
import {useToastStore} from "~/stores/toastStore";

const toastStore = useToastStore()
const { t } = useI18n()

const mainNavItems = [
  { name: t('dashboard'), url: '/' },
  { name: t('customers'), url: 'customers' },
  { name: t('users'), url: 'users' },
]

const userNavItems = [
  { name: t('settings'), url: 'settings', icon: Settings },
  { name: t('logout'), url: 'logout', icon: LogOut },
]
</script>

<template>
  <NuxtLoadingIndicator color="var(--primary)"/>
  <header class="bg-background border-b border-border shadow">
    <div class="container">
      <nav class="flex justify-between items-center">
        <div class="flex gap-8 items-center">
          <NuxtLinkLocale to="/">
            <img src="/logo.svg" :alt="APP_NAME" class="h-9">
          </NuxtLinkLocale>
          <ul class="flex gap-6">
            <li v-for="item in mainNavItems">
              <NuxtLinkLocale :to="item.url" activeClass="text-primary font-medium" class="inline-block px-2 py-4 text-sm hover:text-accent duration-150">{{ item.name }}</NuxtLinkLocale>
            </li>
          </ul>
        </div>
        <div>
          <ul class="flex gap-4">
            <li v-for="item in userNavItems">
              <NuxtLinkLocale :to="item.url" class="inline-block p-2 duration-150">
                <component :is="item.icon" class="size-4"/>
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>

  <div class="py-10">
    <div class="container">
      <slot/>
    </div>
  </div>

  <Toaster :toasts="toastStore.toasts" />

</template>