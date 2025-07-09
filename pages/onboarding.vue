<script setup lang="ts">
import type {Database} from "~/types/database.types";
import Authentication from "~/layouts/authentication.vue";
import {toTypedSchema} from "@vee-validate/zod";
import * as z from 'zod'
import {useForm} from "vee-validate";
import {APP_NAME} from "~/constants";

definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toastStore = useToastStore()
const {t} = useI18n()

useHead({
  title: t("onboarding.onboarding"),
})

const theme = ref('purple')
const loading = ref(false)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2),
  theme: z.string(),
}))

const {handleSubmit} = useForm({
  initialValues: {
    name: '',
    theme: 'purple',
  },
  validationSchema: formSchema,
})

await useAsyncData('profile', async () => {
  const {data} = await supabase.from('profiles').upsert(
    {
      user_id: user.value?.id
    },
    {
      onConflict: 'user_id'
    }
  )
  return data
})

const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true
    const {error} = await supabase
      .from('profiles')
      .upsert({
        user_id: user.value?.id,
        name: values.name,
        theme: values.theme
      }, {
        onConflict: 'user_id'
      })
    if (error) throw error
    await navigateTo('/')
    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: t('profiles.profiles'),
    })
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: t('profiles.profiles'),
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})

watch(theme, (newTheme: string) => {
  if (newTheme) {
    switch (newTheme) {
      case 'purple':
        document.documentElement.style.setProperty('--primary', 'hsl(240 100% 80%)')
        document.documentElement.style.setProperty('--background', 'hsl(240 100% 98%)')
        break
      case 'pink':
        document.documentElement.style.setProperty('--primary', 'hsl(330 100% 85%)')
        document.documentElement.style.setProperty('--background', 'hsl(330 100% 98%)')
        break
      case 'blue':
        document.documentElement.style.setProperty('--primary', 'hsl(210 100% 75%)')
        document.documentElement.style.setProperty('--background', 'hsl(220 100% 98%)')
        break
      case 'green':
        document.documentElement.style.setProperty('--primary', 'hsl(120 100% 80%)')
        document.documentElement.style.setProperty('--background', 'hsl(120 100% 98%)')
        break
      case 'red':
        document.documentElement.style.setProperty('--primary', 'hsl(0 100% 80%)')
        document.documentElement.style.setProperty('--background', 'hsl(0 100% 98%)')
        break
      case 'orange':
        document.documentElement.style.setProperty('--primary', 'hsl(30 100% 80%)')
        document.documentElement.style.setProperty('--background', 'hsl(30 100% 98%)')
        break
    }
  }
})
</script>

<template>
  <Authentication :title="$t('account.profile.welcome_to', {appName: APP_NAME})"
                  :description="$t('account.profile.lets_start_with_your_profile')">
    <form @submit="onSubmit" class="space-y-6">
      <section id="profile-settings" class="space-y-6">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>{{ $t('account.profile.name') }}</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" type="radio" name="theme">
          <FormItem class="space-y-3">
            <FormLabel>{{ $t('account.preferences.theme') }}</FormLabel>

            <FormControl>
              <RadioGroup
                class="grid grid-cols-2 sm:grid-cols-3 gap-3"
                v-bind="componentField"
                v-model="theme"
              >
                <FormItem class="group">
                  <FormControl class="absolute opacity-0 size-0">
                    <RadioGroupItem value="purple"/>
                  </FormControl>
                  <FormLabel
                    class="flex items-center bg-white border rounded-lg px-3 py-3 sm:py-2.5 group-[:has([data-active])]:bg-[#B2B2FF]/20 group-[:has([data-active])]:border-[#9999FF]">
                    <div class="size-2 rounded-full bg-[#9999FF] shrink-0"></div>
                    {{ $t('account.preferences.themes.purple') }}
                  </FormLabel>
                </FormItem>
                <FormItem class="group">
                  <FormControl class="peer absolute opacity-0 size-0">
                    <RadioGroupItem value="pink"/>
                  </FormControl>
                  <FormLabel
                    class="flex items-center bg-white border rounded-lg px-3 py-3 sm:py-2.5 group-[:has([data-active])]:bg-[#FFB2D9]/20 group-[:has([data-active])]:border-[#FFB2D9]">
                    <div class="size-2 rounded-full bg-[#FFB2D9] shrink-0"></div>
                    {{ $t('account.preferences.themes.pink') }}
                  </FormLabel>
                </FormItem>
                <FormItem class="group">
                  <FormControl class="absolute opacity-0 size-0">
                    <RadioGroupItem value="blue"/>
                  </FormControl>
                  <FormLabel
                    class="flex items-center bg-white border rounded-lg px-3 py-3 sm:py-2.5 group-[:has([data-active])]:bg-[#6080FF]/20 group-[:has([data-active])]:border-[#80BFFF]">
                    <div class="size-2 rounded-full bg-[#80BFFF] shrink-0"></div>
                    {{ $t('account.preferences.themes.blue') }}
                  </FormLabel>
                </FormItem>
                <FormItem class="group">
                  <FormControl class="absolute opacity-0 size-0">
                    <RadioGroupItem value="green"/>
                  </FormControl>
                  <FormLabel
                    class="flex items-center bg-white border rounded-lg px-3 py-3 sm:py-2.5 group-[:has([data-active])]:bg-[#B2FFB2]/20 group-[:has([data-active])]:border-[#99FF99]">
                    <div class="size-2 rounded-full bg-[#99FF99] shrink-0"></div>
                    {{ $t('account.preferences.themes.green') }}
                  </FormLabel>
                </FormItem>
                <FormItem class="group">
                  <FormControl class="absolute opacity-0 size-0">
                    <RadioGroupItem value="red"/>
                  </FormControl>
                  <FormLabel
                    class="flex items-center bg-white border rounded-lg px-3 py-3 sm:py-2.5 group-[:has([data-active])]:bg-[#FFB2B2]/20 group-[:has([data-active])]:border-[#FF9999]">
                    <div class="size-2 rounded-full bg-[#FF9999] shrink-0"></div>
                    {{ $t('account.preferences.themes.red') }}
                  </FormLabel>
                </FormItem>
                <FormItem class="group">
                  <FormControl class="absolute opacity-0 size-0">
                    <RadioGroupItem value="orange"/>
                  </FormControl>
                  <FormLabel
                    class="flex items-center bg-white border rounded-lg px-3 py-3 sm:py-2.5 group-[:has([data-active])]:bg-[#FFB280]/20 group-[:has([data-active])]:border-[#FFCC99]">
                    <div class="size-2 rounded-full bg-[#FFCC99] shrink-0"></div>
                    {{ $t('account.preferences.themes.orange') }}
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>
      </section>

      <Button type="submit" class="w-full" :loading="loading">
        {{ $t('common.actions.save') }}
      </Button>
    </form>
  </Authentication>
</template>

<style scoped>

</style>