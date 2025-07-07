<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";

const props = defineProps<{
  settings?: any
}>()

const toastStore = useToastStore()
const {t} = useI18n()

const loading = ref(false)

const formSchema = toTypedSchema(z.object({
  example: z.string(),
}))

const form = useForm({
  initialValues: {
    example: '',
  },
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true

    // Save settings
    console.log(values)

    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: t('settings.settings', 2)
    })
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: t('settings.settings', 2)
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="example">
      <FormItem>
        <FormLabel>Example</FormLabel>
        <FormControl>
          <Input v-bind="componentField"/>
        </FormControl>
      </FormItem>
    </FormField>
    <Button :loading="loading">
      {{ capitalizeSentence($t('common.actions.save_item', {item: $t('settings.settings', 2)})) }}
    </Button>
  </form>
</template>

<style scoped>

</style>