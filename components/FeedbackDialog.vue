<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";
import type {Database} from "~/types/database.types";
import {MessageSquare, CheckCircle, LoaderCircle} from "lucide-vue-next";

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toastStore = useToastStore()
const {t} = useI18n()

const categoryOptions = [
  {label: t('feedback.categories.bug'), value: 'bug'},
  {label: t('feedback.categories.feature_request'), value: 'feature_request'},
  {label: t('feedback.categories.other'), value: 'other'},
]

const success = ref(false)
const loading = ref(false)

const formSchema = toTypedSchema(z.object({
  category: z.string(),
  message: z.string().min(10, {message: t('common.validations.min_length', {length: 10})}),
}))

const form = useForm({
  initialValues: {
    category: '',
    message: ''
  },
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true

    const {fullPath} = useRoute()

    const browserInfo = {
      userAgent: navigator.userAgent,
      browserLanguage: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      url: fullPath
    }

    const {error} = await supabase.from('feedback').insert({
      user_id: user.value?.id,
      category: values.category,
      content: values.message,
      browser_info: browserInfo
    })
    if (error) throw error

    success.value = true
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: t('feedback.feedback')
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" size="sm" class="w-full justify-start font-normal hover:bg-foreground/5 p-2">
        <MessageSquare class="shrink-0" aria-hidden="true"/>
        <span class="truncate">{{ $t('feedback.give_feedback') }}</span>
      </Button>
    </DialogTrigger>
    <DialogContent class="max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ $t('feedback.title') }}</DialogTitle>
        <DialogDescription>{{ $t('feedback.description') }}</DialogDescription>
      </DialogHeader>
      <form v-if="!success && !loading" id="feedback-form" @submit="onSubmit" class="space-y-6">
        <FormField v-slot="{ componentField }" name="category">
          <FormItem>
            <FormLabel>{{ $t('feedback.category') }}</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="$t('feedback.select_a_category')"/>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="option in categoryOptions" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage/>
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="message">
          <FormItem>
            <FormLabel>{{ $t('feedback.message') }}</FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" rows="4"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>
      </form>
      <div v-else-if="loading" class="flex items-center justify-center h-24">
        <span class="sr-only">{{ $t('common.general.loading') }}</span>
        <LoaderCircle class="size-6 text-primary animate-spin" aria-hidden="true"/>
      </div>
      <Alert v-else-if="success" variant="success">
        <CheckCircle class="size-4"/>
        <AlertTitle>{{ $t('feedback.success.title') }}</AlertTitle>
        <AlertDescription>{{ $t('feedback.success.description') }}</AlertDescription>
      </Alert>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">{{ $t('common.actions.close') }}</Button>
        </DialogClose>
        <Button v-if="!success" :loading="loading" form="feedback-form">{{ $t('common.actions.send_item', {item: $t('feedback.feedback')}) }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>