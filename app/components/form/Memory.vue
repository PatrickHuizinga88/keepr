<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useForm } from "vee-validate";
import type { Database, Tables } from "~~/types/database.types";
import { PlusCircle } from "lucide-vue-next";
import { v4 as uuidv4 } from "uuid";
import MultiImageUpload from "~/components/MultiImageUpload.vue";

const props = defineProps<{
  memory?: Tables<"memories">;
  collectionId: string | number;
}>();

const toastStore = useToastStore();
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const localePath = useLocalePath();
const route = useRoute();

const formSchema = toTypedSchema(
  z.object({
    title: z.string(),
    location: z.string().optional(),
    content: z.string(),
    cover_image: z.string().optional(),
    date_from: z.string(),
    date_to: z.string().optional(),
    sections: z
      .array(
        z.object({
          content: z.string(),
          media: z.array(z.string()),
        }),
      )
      .optional(),
  }),
);

const form = useForm({
  initialValues: {
    title: props.memory?.title || "",
    location: props.memory?.location || "",
    content: props.memory?.content || "",
    cover_image: props.memory?.cover_image || "",
    date_from: props.memory?.date_from || "",
    date_to: props.memory?.date_to || "",
    sections: props.memory?.memory_sections || [],
  },
  validationSchema: formSchema,
});

const loading = ref(false);
const dateRange = ref(false);
const sections = ref<Tables<"memory_sections">[]>(props.memory?.memory_sections || []);

const sortedSections = computed(() => {
  return sections.value.sort(
    (a: Tables<"memory_sections">, b: Tables<"memory_sections">) => a.order_index - b.order_index,
  );
});

const addSection = () => {
  sections.value.push({
    id: uuidv4(),
    memory_id: props.memory?.id,
    content: "",
    order_index: sections.value.length + 1,
  });
};

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true;
    const { data: memory, error: memoryError } = await supabase
      .from("memories")
      .upsert(
        {
          id: props.memory?.id,
          collection_id: route.params.collectionId,
          title: values.title,
          slug: slugify(values.title),
          location: values.location,
          cover_image: values.cover_image || null,
          content: values.content,
          date_from: values.date_from || null,
          date_to: values.date_to || null,
          created_by: user.value.id,
        },
        {
          onConflict: "id",
        },
      )
      .select();
    if (memoryError) throw memoryError;

    const { error: sectionsError } = await supabase.from("memory_sections").upsert(
      sections.value.map((section, index) => ({
        id: section.id,
        memory_id: memory[0].id,
        content: values.sections[index].content,
        order_index: section.order_index,
        created_at: section.created_at || new Date().toISOString(),
      })),
      {
        onConflict: "id",
      },
    );
    if (sectionsError) throw sectionsError;

    const sectionMediaFiles = values.sections.flatMap((section) =>
      section.media
        ? section.media.map((mediaUrl: string) => ({
            id: uuidv4(),
            memory_id: memory[0].id,
            section_id: section.id,
            url: `${props.collectionId}/${mediaUrl}`,
            type: "image",
            created_by: user.value.id,
          }))
        : [],
    );

    const { error: mediaError } = await supabase.from("media").upsert(sectionMediaFiles, {
      onConflict: "url",
    });
    if (mediaError) throw mediaError;

    await navigateTo(
      localePath({
        name: "collectionId-memories-slug",
        params: { collectionId: route.params.collectionId, slug: slugify(values.title) },
      }),
    );

    toastStore.createToast({
      type: "success",
      action: "save",
      item: values.title,
    });
  } catch (error) {
    toastStore.createToast({
      type: "destructive",
      action: "save",
      item: values.title,
    });
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <form @submit="onSubmit" class="space-y-12">
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="title">
        <FormItem>
          <FormLabel>{{ $t("memories.title") }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="location">
        <FormItem>
          <FormLabel>{{ $t("memories.location") }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ componentField }" name="content">
      <FormItem>
        <FormLabel>{{ $t("memories.content") }}</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" rows="6" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="cover_image">
      <FormItem>
        <FormLabel>{{ $t("memories.cover_image") }}</FormLabel>
        <FormControl>
          <!--          <FileInput v-bind="componentField"/>-->
          <ImageUpload
            v-bind="componentField"
            :collection-id="props.collectionId"
            accept="image/*"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid sm:grid-cols-2 gap-6">
      <div class="space-y-4">
        <FormField v-slot="{ componentField }" name="date_from">
          <FormItem>
            <FormLabel>{{ $t("memories.date_from") }}</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="flex items-center space-x-2">
          <Switch
            id="date-range-switch"
            :model-value="dateRange"
            @update:model-value="dateRange = !dateRange"
          />
          <Label for="date-range-switch">Meerdere dagen</Label>
        </div>
      </div>
      <FormField v-if="dateRange" v-slot="{ componentField }" name="date_to">
        <FormItem>
          <FormLabel>{{ $t("memories.date_to") }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="date" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <div class="space-y-6">
      <h2>{{ $t("memories.sections.sections", 2) }}</h2>

      <div v-for="(section, index) in sortedSections" class="space-y-6">
        <FormField v-slot="{ componentField }" :name="`sections[${index}].content`">
          <FormItem>
            <FormLabel>{{ $t("memories.content") }}</FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" rows="6" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" :name="`sections[${index}].media`">
          <FormItem>
            <FormLabel>{{ $t("memories.sections.media") }}</FormLabel>
            <FormControl>
              <MultiImageUpload
                v-bind="componentField"
                :collection-id="props.collectionId"
                accept="image/*"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <Button @click="addSection" type="button" variant="outline" class="w-full">
        <PlusCircle />
        {{ $t("common.actions.add_item", { item: $t("memories.sections.sections", 1) }) }}
      </Button>
    </div>

    <Button :loading="loading" class="w-full lg:w-auto">
      {{ capitalizeSentence($t("common.actions.save_item", { item: $t("memories.memories", 1) })) }}
    </Button>
  </form>
</template>
