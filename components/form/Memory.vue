<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";
import type {Database, Tables} from "~/types/database.types";
import {PlusCircle} from "lucide-vue-next";
import {v4 as uuidv4} from 'uuid'

const props = defineProps<{
  memory?: Tables<'memories'>
}>()

const toastStore = useToastStore()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const localePath = useLocalePath()
const route = useRoute()

const formSchema = toTypedSchema(z.object({
  title: z.string(),
  location: z.string().optional(),
  content: z.string(),
  cover_image: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sections: z.array(z.object({
    content: z.string(),
    media: z
      .union([
        z.instanceof(File),
        z.array(z.instanceof(File))
      ])
      .optional()
  })).optional()
}))

const form = useForm({
  initialValues: {
    title: props.memory?.title || '',
    location: props.memory?.location || '',
    content: props.memory?.content || '',
    cover_image: props.memory?.cover_image || '',
    date_from: props.memory?.date_from || '',
    date_to: props.memory?.date_to || '',
    sections: props.memory?.memory_sections || [],
  },
  validationSchema: formSchema,
})

const loading = ref(false)
const sections = ref<Tables<'memory_sections'>[]>(props.memory?.sections || [])

const sortedSections = computed(() => {
  return sections.value.sort((
    a: Tables<'memory_sections'>,
    b: Tables<'memory_sections'>
  ) => a.order_index - b.order_index)
})

const addSection = () => {
  sections.value.push({
    id: uuidv4(),
    memory_id: props.memory?.id,
    content: '',
    order_index: sections.value.length + 1,
  })
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true
    const {data: memory, error: memoryError} = await supabase.from('memories').upsert({
      id: props.memory?.id,
      collection_id: route.params.collectionId,
      title: values.title,
      slug: slugify(values.title),
      location: values.location,
      content: values.content,
      // cover_image: values.cover_image, TODO: Fix cover image handling
      date_from: values.date_from,
      date_to: values.date_to,
      created_by: user.value.id,
    }, {
      onConflict: 'id'
    }).select()
    if (memoryError) throw memoryError

    const {error: sectionsError} = await supabase.from('memory_sections').upsert(
      {
        onConflict: 'id'
      }
    )
    if (sectionsError) throw sectionsError

    await navigateTo(localePath({
      name: 'collectionId-memories-slug',
      params: {collectionId: route.params.collectionId, slug: slugify(values.title)}
    }))

    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: values.title
    })
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: values.title
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="title">
        <FormItem>
          <FormLabel>{{ $t('memories.title') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="location">
        <FormItem>
          <FormLabel>{{ $t('memories.location') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ componentField }" name="content">
      <FormItem>
        <FormLabel>{{ $t('memories.content') }}</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" rows="6"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="cover_image">
      <FormItem>
        <FormLabel>{{ $t('memories.cover_image') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="text"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>

    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="date_from">
        <FormItem>
          <FormLabel>{{ $t('memories.date_from') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="date"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="date_to">
        <FormItem>
          <FormLabel>{{ $t('memories.date_to') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="date"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>

    <h2>{{ $t('memories.sections', 2) }}</h2>

    <div v-for="(section, index) in sortedSections">
      <FormField v-slot="{ componentField }" :name="`sections[${index}].content`">
        <FormItem>
          <FormLabel>{{ $t('memories.content') }}</FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" rows="6"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" :name="`sections[${index}].media`">
        <FormItem>
          <FormLabel>{{ $t('memories.sections.media') }}</FormLabel>
          <FormControl>
            <Input type="file" v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>

    <Button @click="addSection" type="button" variant="outline" class="w-full">
      <PlusCircle/>
      {{ $t('common.actions.add_item', {item: $t('memories.sections', 1)}) }}
    </Button>

    <Button :loading="loading" class="w-full lg:w-auto">
      {{ capitalizeSentence($t('common.actions.save_item', {item: $t('memories.memories', 1)})) }}
    </Button>
  </form>
</template>