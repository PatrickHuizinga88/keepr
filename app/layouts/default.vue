<script setup lang="ts">
import { UserCircle } from "lucide-vue-next";
import Toaster from "~/components/ui/toast/Toaster.vue";
import { APP_NAME as appName } from "~~/constants";
import { useToastStore } from "~/stores/toastStore";
import type { Database } from "~~/types/database.types";

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const toastStore = useToastStore();

const { data: theme } = await useAsyncData("theme", async () => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("theme")
    .eq("user_id", user.value?.id)
    .single();
  return profile.theme;
});
useGlobalHead(theme.value);
</script>

<template>
  <NuxtLoadingIndicator color="var(--primary)" />
  <header class="bg-background">
    <div class="container">
      <nav class="h-16 flex justify-between items-center gap-8">
        <NuxtLinkLocale to="/">
          <img src="/logo.svg" :alt="appName" class="h-9" />
        </NuxtLinkLocale>
        <Button variant="ghost" size="icon" as-child>
          <NuxtLinkLocale to="account">
            <UserCircle />
          </NuxtLinkLocale>
        </Button>
      </nav>
    </div>
  </header>

  <div class="pb-6 sm:pb-10">
    <slot />
  </div>

  <Toaster :toasts="toastStore.toasts" />
</template>
