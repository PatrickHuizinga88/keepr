<script setup lang="ts">
import type { Database } from "~~/types/database.types";
import { ArrowLeft, PlusCircle, Settings2 } from "lucide-vue-next";

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();

const collectionId = route.params.collectionId as string;

const { data: collection, refresh: refreshCollection } = await useAsyncData(
  "collection",
  async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("*, collection_members(user_id)")
      .eq("id", collectionId)
      .single();
    if (error) throw error;

    const memberIds = data.collection_members.map((m) => m.user_id);
    const { data: profiles } = memberIds.length
      ? await supabase.from("profiles").select("user_id, name").in("user_id", memberIds)
      : { data: [] };

    return {
      ...data,
      members: (profiles || []).map((p) => ({ user_id: p.user_id, name: p.name })),
    };
  },
);

useHead({
  title: collection.value?.name || t("home.untitled_collection"),
});

const { data: memories } = await useAsyncData("collection-memories", async () => {
  const { data, error } = await supabase
    .from("memories")
    .select("id, title, slug, date_from, date_to, location, cover_image")
    .eq("collection_id", collectionId)
    .order("date_from", { ascending: true });
  if (error) throw error;
  return data;
});

const coverImages = ref<Record<string, string>>({});

onMounted(async () => {
  if (!memories.value) return;
  for (const memory of memories.value) {
    if (memory.cover_image) {
      const { data } = await supabase.storage
        .from("media")
        .createSignedUrl(memory.cover_image, 3600);
      if (data) coverImages.value[memory.id] = data.signedUrl;
    }
  }
});

const editSheetOpen = ref(false);

const onCollectionUpdated = async () => {
  editSheetOpen.value = false;
  await refreshCollection();
};
</script>

<template>
  <div>
    <div
      class="relative h-44 flex flex-col justify-between overflow-hidden rounded-b-3xl"
      :style="{ 'background-color': collection?.cover_color || '#DBEAFE' }"
    >
      <div class="collection-header-bg absolute inset-0" />

      <!-- Nav -->
      <div class="relative container flex items-center justify-between pt-5">
        <NuxtLinkLocale to="/">
          <Button
            size="sm"
            variant="ghost"
            class="text-black/55 hover:text-black/80 hover:bg-black/8 gap-1"
          >
            <ArrowLeft class="size-3.5" />
            {{ $t("common.actions.back") }}
          </Button>
        </NuxtLinkLocale>

        <Button
          size="sm"
          variant="ghost"
          class="text-black/55 hover:text-black/80 hover:bg-black/8"
          @click="editSheetOpen = true"
        >
          <Settings2 class="size-4" />
          {{ $t("common.actions.edit") }}
        </Button>
      </div>

      <!-- Centered title, like a chapter heading inside the book -->
      <div class="relative container text-center px-8 pt-5 pb-14">
        <h1 class="text-3xl font-semibold text-black/70 leading-tight">
          {{ collection?.name || $t("home.untitled_collection") }}
        </h1>
        <p class="text-sm text-black/50 mt-0.5">
          {{ $t("home.memories_count", memories?.length ?? 0) }}
        </p>
      </div>
    </div>

    <!-- Page content -->
    <div class="container py-8">
      <div class="flex justify-end mb-10">
        <NuxtLinkLocale
          :to="localePath({ name: 'collectionId-memories-create', params: { collectionId } })"
        >
          <Button>
            <PlusCircle class="size-4" />
            {{
              capitalizeSentence(
                $t("common.general.new", { item: lowercase($t("memories.memories", 1)) }),
              )
            }}
          </Button>
        </NuxtLinkLocale>
      </div>

      <!-- Polaroid grid -->
      <div v-if="memories?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8">
        <NuxtLinkLocale
          v-for="(memory, index) in memories"
          :key="memory.id"
          :to="
            localePath({
              name: 'collectionId-memories-slug',
              params: { collectionId, slug: memory.slug },
            })
          "
          class="no-underline"
        >
          <!-- Polaroid card: alternating slight tilt, snaps straight on hover -->
          <div
            class="polaroid bg-white shadow-[0_2px_10px_rgba(0,0,0,0.10)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.14)] hover:scale-[1.04] hover:rotate-0 transition-all duration-200 cursor-pointer"
            :class="index % 2 === 0 ? '-rotate-[1deg]' : 'rotate-[1deg]'"
          >
            <!-- Photo area in the collection's cover color as placeholder -->
            <div
              class="aspect-square relative overflow-hidden"
              :style="{ backgroundColor: collection?.cover_color || '#DBEAFE' }"
            >
              <img
                v-if="coverImages[memory.id]"
                :src="coverImages[memory.id]"
                :alt="memory.title"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="absolute inset-0 book-cover"
                :style="{ '--cover': collection?.cover_color || '#DBEAFE' }"
              />
            </div>

            <!-- Caption — handwritten feel -->
            <div class="text-center pt-3 pb-1 px-2">
              <p class="font-cursive text-lg leading-snug text-black/60 truncate">
                {{ memory.title }}
              </p>
              <p v-if="memory.date_from" class="text-black/30 mt-0.5">
                {{ $dayjs(memory.date_from).format("D MMM YYYY") }}
              </p>
            </div>
          </div>
        </NuxtLinkLocale>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <p class="font-cursive text-xl text-black/25 mb-6">
          {{ $t("collections.no_memories") }}
        </p>
        <NuxtLinkLocale
          :to="localePath({ name: 'collectionId-memories-create', params: { collectionId } })"
        >
          <Button variant="outline">
            <PlusCircle class="size-4" />
            {{
              capitalizeSentence(
                $t("common.general.new", { item: lowercase($t("memories.memories", 1)) }),
              )
            }}
          </Button>
        </NuxtLinkLocale>
      </div>
    </div>

    <!-- Edit sheet -->
    <Sheet v-model:open="editSheetOpen">
      <SheetContent side="right" class="sm:max-w-md overflow-y-auto">
        <SheetHeader class="mb-6">
          <SheetTitle>
            {{
              capitalizeSentence(
                $t("common.actions.edit_item", {
                  item: lowercase($t("collections.collection", 1)),
                }),
              )
            }}
          </SheetTitle>
        </SheetHeader>

        <FormCollection
          v-if="collection"
          :collection="collection"
          :collection-id="collectionId"
          @updated="onCollectionUpdated"
        />
      </SheetContent>
    </Sheet>
  </div>
</template>

<style scoped>
/* Same gloss + binding-shadow treatment as the book on the home page */
.book-cover {
  background-color: var(--cover);
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0) 7%),
    linear-gradient(250deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 55%),
    linear-gradient(to top, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0) 30%);
}

/* Darker strip on the left edge — the bound spine of the opened book */
.book-spine {
  background-color: var(--cover);
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0));
}

/* A thin white band at the bottom of the cover gives the feel of a page curling up underneath */
.page-curl {
  height: 18px;
  background: white;
  border-radius: 60% 60% 0 0 / 100% 100% 0 0;
  opacity: 0.55;
}

/* Polaroid proportions: thin border on 3 sides, thick white strip at bottom for the caption */
.polaroid {
  padding: 6px 6px 36px;
  border-radius: 2px;
}
</style>
