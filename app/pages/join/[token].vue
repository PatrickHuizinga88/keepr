<script setup lang="ts">
import type { Database } from "~~/types/database.types";
import { CheckCircle, XCircle, BookHeart } from "lucide-vue-next";

const route = useRoute();
const supabase = useSupabaseClient<Database>();
const {
  data: { user },
} = await supabase.auth.getUser();
const localePath = useLocalePath();
const toastStore = useToastStore();
const { t } = useI18n();

const token = route.params.token as string;

const { data: inviteData } = await useAsyncData("invite-validate", async () => {
  try {
    return await $fetch<{ valid: boolean; collectionId: string; collectionName: string | null }>(
      `/api/invite/${token}`,
    );
  } catch {
    return null;
  }
});

useHead({
  title: inviteData.value?.collectionName || t("collections.invite.join_title"),
});

const joining = ref(false);
const joined = ref(false);

const join = async () => {
  if (!inviteData.value || !user) return;
  try {
    joining.value = true;
    const { error } = await supabase.from("collection_members").insert({
      collection_id: inviteData.value.collectionId,
      user_id: user.id,
    });
    // Ignore unique violation — user is already a member
    if (error && error.code !== "23505") throw error;

    joined.value = true;
    toastStore.createToast({
      type: "success",
      action: "save",
      item: inviteData.value.collectionName || t("collections.collection", 1),
    });

    setTimeout(async () => {
      await navigateTo(localePath(`/${inviteData.value!.collectionId}`));
    }, 1500);
  } catch (error) {
    console.error(error);
    toastStore.createToast({ type: "destructive", isError: true });
  } finally {
    joining.value = false;
  }
};
</script>

<template>
  <div
    class="container max-w-sm mx-auto flex flex-col items-center justify-center py-24 text-center"
  >
    <div v-if="!inviteData">
      <XCircle class="size-14 mx-auto text-destructive mb-5" />
      <h1 class="text-xl font-semibold mb-2">{{ $t("collections.invite.invalid") }}</h1>
      <NuxtLinkLocale to="/" class="mt-6 inline-block">
        <Button variant="outline">{{ $t("common.actions.back") }}</Button>
      </NuxtLinkLocale>
    </div>

    <div v-else-if="joined">
      <CheckCircle class="size-14 mx-auto text-green-600 mb-5" />
      <h1 class="text-xl font-semibold">{{ $t("collections.invite.join_success") }}</h1>
    </div>

    <div v-else>
      <BookHeart class="size-14 mx-auto text-primary mb-5" />
      <h1 class="text-xl font-semibold mb-2">{{ $t("collections.invite.join_title") }}</h1>
      <p class="text-muted-foreground mb-2">{{ $t("collections.invite.join_description") }}</p>
      <p class="font-semibold text-lg mb-8">
        {{ inviteData.collectionName || $t("home.untitled_collection") }}
      </p>
      <Button :loading="joining" class="w-full" @click="join">
        {{ $t("collections.invite.join_button") }}
      </Button>
    </div>
  </div>
</template>
