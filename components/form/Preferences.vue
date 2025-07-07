<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";

const toastStore = useToastStore()
const colorMode = useColorMode()
const {t, locale, locales, setLocale} = useI18n()
const router = useRouter()

const loading = ref(false)

const languageOptions =
    locales.value.map(locale => ({
      value: locale.code,
      label: locale.name
    }))

const themeOptions = [{
  value: 'light',
  label: t('account.preferences.themes.light')
}, {
  value: 'dark',
  label: t('account.preferences.themes.dark')
}, {
  value: 'system',
  label: t('account.preferences.themes.system_default')
}]

const formSchema = toTypedSchema(z.object({
  language: z.enum(['en', 'nl']),
  theme: z.string()
}))

const form = useForm({
  initialValues: {
    language: locale.value,
    theme: colorMode.preference
  },
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true
  colorMode.preference = values.theme
  await setLocale(values.language)
  await router.push({
    query: {refresh: 'true'}
  })
  location.reload()
})

onMounted(() => {
  if (useRoute().query.refresh) {
    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: t('account.preferences.preferences', 2)
    })
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="language">
        <FormItem>
          <FormLabel>{{ $t('account.preferences.language') }}</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('account.preferences.select_a_language')"/>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="option in languageOptions" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="theme">
        <FormItem>
          <FormLabel>{{ $t('account.preferences.theme') }}</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('account.preferences.select_a_theme')"/>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="option in themeOptions" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      </FormField>
    </div>
    <div class="flex flex-col items-start sm:flex-row sm:items-center gap-2 sm:gap-4">
      <Button :loading="loading">
        {{ capitalizeSentence($t('common.actions.save_item', {item: $t('account.preferences.preferences', 2)})) }}
      </Button>
      <p class="text-sm text-muted-foreground">{{ $t('account.preferences.refresh_page') }}</p>
    </div>
  </form>
</template>
