<script setup lang="ts">
import type { Database } from "~~/types/database.types";

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
    .select("*, memories(id), collection_members(user_id)")
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

const COVER_COLORS = [
  "#FDE8E8",
  "#FEF3C7",
  "#D1FAE5",
  "#DBEAFE",
  "#EDE9FE",
  "#FCE7F3",
  "#E0F2FE",
  "#F0FDF4",
];

function getCoverColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return COVER_COLORS[hash % COVER_COLORS.length];
}

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
        class="book-link group flex flex-col items-start no-underline cursor-pointer"
      >
        <div
          class="book relative aspect-[2/3] ml-3.5 mb-5 w-[calc(100%-14px)] transition-transform duration-200 group-hover:-translate-y-1"
          :style="{ '--cover': getCoverColor(collection.id) }"
        >
          <span
            class="absolute bottom-3.5 left-3 right-3 text-sm font-semibold leading-snug break-words text-black/70"
          >
            {{ collection.name || $t("home.untitled_collection") }}
          </span>
        </div>

        <div class="mt-3.5 text-left w-full">
          <p class="text-sm font-medium text-foreground truncate">
            {{ formatMembers(collection.memberNames) }}
          </p>
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
    linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 5%),
    /* Gloss */ linear-gradient(150deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 45%);
  border-radius: 2px 4px 4px 2px;
  box-shadow: 2px 6px 20px rgba(0, 0, 0, 0.15);
}

/* Left spine — flush with cover top, same cover color darkened */
.book::before {
  content: "";
  position: absolute;
  left: -4px;
  right: 0px;
  top: 0;
  height: calc(100% + 14px);
  background-color: var(--cover);
  background-image: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15));
  border-radius: 10px 0 4px 4px;
  z-index: -10;
}

/* Bottom pages — offset right to match spine depth */
.book::after {
  content: "";
  position: absolute;
  top: 100%;
  left: -1px;
  right: 2px;
  height: 12px;
  background: repeating-linear-gradient(to bottom, #f2f2f2 0px, #c8c8c8 1px);
  border-radius: 0 0px 1px 0;
}
</style>
