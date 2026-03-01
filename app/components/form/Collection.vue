<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useForm } from "vee-validate";
import { Copy, Check, Link } from "lucide-vue-next";
import type { Database } from "~~/types/database.types";

const props = defineProps<{
  collection: {
    id: string;
    name: string | null;
    cover_color: string | null;
    members: { user_id: string; name: string | null }[];
  };
  collectionId: string;
}>();

const emit = defineEmits<{
  (e: "updated"): void;
}>();

const supabase = useSupabaseClient<Database>();
const toastStore = useToastStore();
const { t } = useI18n();

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

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, { message: t("common.validations.required") }),
    cover_color: z.string(),
  }),
);

const form = useForm({
  initialValues: {
    name: props.collection.name || "",
    cover_color: props.collection.cover_color || COVER_COLORS[0],
  },
  validationSchema: formSchema,
});

const loading = ref(false);
const inviteUrl = ref<string | null>(null);
const inviteLoading = ref(false);
const copied = ref(false);

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true;
    const { error } = await supabase
      .from("collections")
      .update({ name: values.name, cover_color: values.cover_color })
      .eq("id", props.collectionId);
    if (error) throw error;
    toastStore.createToast({
      type: "success",
      action: "update",
      item: values.name,
    });
    emit("updated");
  } catch (error) {
    toastStore.createToast({
      type: "destructive",
      action: "update",
      item: form.values.name || "",
    });
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const generateInviteLink = async () => {
  try {
    inviteLoading.value = true;
    const data = await $fetch<{ url: string }>("/api/invite/generate", {
      method: "POST",
      body: { collectionId: props.collectionId },
    });
    inviteUrl.value = data.url;
  } catch (error) {
    console.error(error);
    toastStore.createToast({ type: "destructive", isError: true });
  } finally {
    inviteLoading.value = false;
  }
};

const copyInviteLink = async () => {
  if (!inviteUrl.value) return;
  await navigator.clipboard.writeText(inviteUrl.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <form @submit="onSubmit" class="space-y-8">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ $t("common.general.name") }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="cover_color">
      <FormItem>
        <FormLabel>{{ $t("collections.cover_color") }}</FormLabel>
        <FormControl>
          <div class="flex gap-3 flex-wrap pt-1">
            <button
              v-for="color in COVER_COLORS"
              :key="color"
              type="button"
              class="size-8 rounded-full border-2 transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              :class="
                componentField.modelValue === color
                  ? 'border-foreground scale-110 shadow-md'
                  : 'border-transparent'
              "
              :style="{ backgroundColor: color }"
              @click="form.setFieldValue('cover_color', color)"
            />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="space-y-3">
      <Label>{{ $t("collections.members.members", 2) }}</Label>
      <div v-if="collection.members.length" class="space-y-2">
        <div
          v-for="member in collection.members"
          :key="member.user_id"
          class="flex items-center gap-2.5 text-sm"
        >
          <div
            class="size-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold shrink-0"
          >
            {{ member.name?.charAt(0)?.toUpperCase() || "?" }}
          </div>
          <span>{{ member.name }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">
        {{ $t("collections.members.no_members") }}
      </p>
    </div>

    <div class="space-y-3">
      <Label>{{ $t("collections.invite.title") }}</Label>
      <p class="text-sm text-muted-foreground">
        {{ $t("collections.invite.link_description") }}
      </p>

      <div v-if="inviteUrl" class="flex gap-2">
        <Input :value="inviteUrl" readonly class="text-xs font-mono" />
        <Button type="button" variant="outline" size="icon" @click="copyInviteLink">
          <Check v-if="copied" class="size-4 text-green-600" />
          <Copy v-else class="size-4" />
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        :loading="inviteLoading"
        class="w-full"
        @click="generateInviteLink"
      >
        <Link class="size-4" />
        {{ $t("collections.invite.generate") }}
      </Button>
    </div>

    <Button :loading="loading" class="w-full lg:w-auto">
      {{
        capitalizeSentence(
          $t("common.actions.save_item", {
            item: lowercase($t("collections.collection", 1)),
          }),
        )
      }}
    </Button>
  </form>
</template>
