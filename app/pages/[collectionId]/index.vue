<script setup lang="ts">
import type { Database } from "~~/types/database.types";
import { ArrowLeft, PlusCircle, Settings2, MapPin } from "lucide-vue-next";

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

const memoriesByYear = computed(() => {
  if (!memories.value?.length) return {} as Record<string, typeof memories.value>;
  const groups: Record<string, typeof memories.value> = {};
  for (const memory of memories.value) {
    const year = memory.date_from
      ? String(new Date(memory.date_from).getFullYear())
      : t("collections.undated");
    if (!groups[year]) groups[year] = [];
    groups[year]!.push(memory);
  }
  return groups;
});

const sortedYears = computed(() =>
  Object.keys(memoriesByYear.value).sort((a, b) => {
    if (a === t("collections.undated")) return 1;
    if (b === t("collections.undated")) return -1;
    return Number(a) - Number(b);
  }),
);

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
      :style="{ '--cover': collection?.cover_color || '#DBEAFE' }"
    >
      <div class="collection-header-bg absolute inset-0" />

      <div class="relative container flex items-center justify-between pt-4">
        <NuxtLinkLocale to="/">
          <Button
            size="sm"
            variant="ghost"
            class="bg-black/10 backdrop-blur-sm text-black/70 hover:bg-black/20 hover:text-black"
          >
            <ArrowLeft class="size-4" />
            {{ $t("common.actions.back") }}
          </Button>
        </NuxtLinkLocale>

        <Button
          size="sm"
          variant="ghost"
          class="bg-black/10 backdrop-blur-sm text-black/70 hover:bg-black/20 hover:text-black"
          @click="editSheetOpen = true"
        >
          <Settings2 class="size-4" />
          {{ $t("common.actions.edit") }}
        </Button>
      </div>

      <div class="relative container pb-5">
        <h1 class="text-2xl font-semibold text-black/80">
          {{ collection?.name || $t("home.untitled_collection") }}
        </h1>
        <p class="text-sm text-black/50 mt-0.5">
          {{ $t("home.memories_count", memories?.length ?? 0) }}
        </p>
      </div>
    </div>

    <div class="container py-8">
      <div class="flex justify-end mb-8">
        <NuxtLinkLocale
          :to="
            localePath({
              name: 'collectionId-memories-create',
              params: { collectionId },
            })
          "
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

      <div v-if="memories?.length" class="space-y-12">
        <div v-for="year in sortedYears" :key="year">
          <h2 class="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {{ year }}
          </h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <NuxtLinkLocale
              v-for="memory in memoriesByYear[year]"
              :key="memory.id"
              :to="
                localePath({
                  name: 'collectionId-memories-slug',
                  params: { collectionId, slug: memory.slug },
                })
              "
              class="no-underline group"
            >
              <div
                class="rounded-2xl overflow-hidden bg-card border hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <div
                  class="h-40 relative overflow-hidden"
                  :style="{ backgroundColor: collection?.cover_color || '#DBEAFE' }"
                >
                  <img
                    v-if="coverImages[memory.id]"
                    :src="coverImages[memory.id]"
                    :alt="memory.title"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div v-else class="absolute inset-0 bg-gradient-to-br from-white/20 to-black/5" />
                </div>

                <div class="p-4">
                  <h3 class="font-semibold truncate">{{ memory.title }}</h3>
                  <p v-if="memory.date_from" class="text-sm text-muted-foreground mt-0.5">
                    {{ $dayjs(memory.date_from).format("D MMMM YYYY") }}
                    <span v-if="memory.date_to">
                      – {{ $dayjs(memory.date_to).format("D MMMM YYYY") }}
                    </span>
                  </p>
                  <p
                    v-if="memory.location"
                    class="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate"
                  >
                    <MapPin class="size-3 shrink-0" />
                    {{ memory.location }}
                  </p>
                </div>
              </div>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-muted-foreground mb-4">{{ $t("collections.no_memories") }}</p>
        <NuxtLinkLocale
          :to="
            localePath({
              name: 'collectionId-memories-create',
              params: { collectionId },
            })
          "
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
.collection-header-bg {
  background-color: var(--cover);
  background-image:
    linear-gradient(250deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 60%),
    linear-gradient(to top, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 40%);
}
</style>
