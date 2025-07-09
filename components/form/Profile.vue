<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";
import type {Database} from "~/types/database.types";

const props = defineProps<{
  name: string
}>()

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toastStore = useToastStore()
const {t} = useI18n()

const loading = ref(false)

const formSchema = toTypedSchema(z.object({
  name: z.string(),
}))

const form = useForm({
  initialValues: {
    name: props.name || '',
  },
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true
    const {error} = await supabase.from('profiles')
        .update({
          name: values.name,
        })
        .eq('user_id', user.value?.id)
    if (error) throw error
    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: t('account.profile.profile'),
    })
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: t('account.profile.profile'),
    })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>{{ $t('account.profile.name') }}</FormLabel>
          <FormControl>
            <Input type="text" placeholder="John" v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>
    <Button :loading="loading" size="sm">
      {{ capitalizeSentence($t('common.actions.save_item', {item: $t('account.profile.profile')})) }}
    </Button>
  </form>
</template>