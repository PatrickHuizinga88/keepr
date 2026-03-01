<script setup lang="ts">
import type { Database } from "~~/types/database.types";
import { Users } from "lucide-vue-next";

const supabase = useSupabaseClient<Database>();
const {
  data: { user },
} = await supabase.auth.getUser();
const { t } = useI18n();

useHead({
  title: t("common.navigation.home"),
});

const { data: profile } = await useAsyncData("profile", async () => {
  if (!user) return;
  const { data, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("user_id", user.id)
    .single();
  if (error) throw error;
  return data;
});

const { data: collections } = await useAsyncData("collections", async () => {
  if (!user) return [];

  const { data: memberRows, error: memberError } = await supabase
    .from("collection_members")
    .select("collection_id")
    .eq("user_id", user.id);

  if (memberError || !memberRows?.length) return [];

  const collectionIds = memberRows.map((m) => m.collection_id);

  const { data: collectionsData, error: collectionsError } = await supabase
    .from("collections")
    .select("*, memories(id), collection_members(user_id), cover_color")
    .in("id", collectionIds);

  if (collectionsError) throw collectionsError;

  const allUserIds = [
    ...new Set(collectionsData.flatMap((c) => c.collection_members.map((m) => m.user_id))),
  ];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, name")
    .in("user_id", allUserIds);

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));

  return collectionsData.map((c) => ({
    ...c,
    memberNames: c.collection_members
      .map((m) => profileMap[m.user_id]?.name)
      .filter((n): n is string => Boolean(n)),
    memoryCount: c.memories.length,
  }));
});

function formatMembers(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}
</script>

<template>
  <div class="container py-8">
    <h1 class="text-2xl font-semibold mb-10">
      {{ `${$t("home.hi")} ${profile?.name || $t("common.general.guest")}` }}
    </h1>

    <div
      v-if="collections?.length"
      class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10"
    >
      <NuxtLinkLocale
        v-for="collection in collections"
        :key="collection.id"
        :to="`/${collection.id}`"
        class="group flex flex-col items-start no-underline cursor-pointer"
      >
        <div
          class="book relative aspect-2/3 ml-1 mb-5 w-[calc(100%-14px)] transition-transform duration-200"
          :style="{ '--cover': collection.cover_color }"
        >
          <span
            class="absolute bottom-3.5 left-4 right-3 text-2xl font-semibold leading-snug wrap-break-word text-black/70"
          >
            {{ collection.name || $t("home.untitled_collection") }}
          </span>
        </div>

        <div class="mt-3.5 text-left w-full">
          <div class="flex items-center gap-2">
            <Users class="size-4" />
            <p class="text-sm font-medium text-foreground truncate">
              {{ formatMembers(collection.memberNames) }}
            </p>
          </div>

          <p class="text-xs text-muted-foreground mt-0.5">
            {{ $t("home.memories_count", collection.memoryCount) }}
          </p>
        </div>
      </NuxtLinkLocale>
    </div>

    <p v-else class="text-sm text-muted-foreground">
      {{ $t("home.no_collections") }}
    </p>
  </div>
</template>

<style scoped>
.book {
  background-color: var(--cover);
  background-image:
    /* Binding shadow on left edge */
    linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 5%),
    /* Gloss */ linear-gradient(250deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 45%),
    /* Shadow on the bottom edge */
    linear-gradient(to top, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 2%);
  border-radius: 6px 8px 8px 6px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
}

/* Left spine — flush with cover top, same cover color darkened */
.book::before {
  content: "";
  position: absolute;
  left: -4px;
  right: 0px;
  top: 0;
  height: calc(100% + 20px);
  background-color: var(--cover);
  background-image: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15));
  border-radius: 10px 8px 8px 8px;
  z-index: -10;
}

/* Bottom pages — offset right to match spine depth */
.book::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0px;
  right: 3px;
  height: 16px;
  background: repeating-linear-gradient(to bottom, #f2f2f2 0px, #c8c8c8 1px);
  border-radius: 6px 0 3px 6px;
}
</style>
