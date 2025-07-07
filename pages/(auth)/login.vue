<script setup lang="ts">
import {ArrowRight} from 'lucide-vue-next'
import {PasswordInput} from "~/components/ui/password-input";
import {toTypedSchema} from "@vee-validate/zod";
import * as z from "zod";
import {useForm} from "vee-validate";

definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient()
const {t} = useI18n()

useHead({
  title: t('authentication.common.sign_in'),
})

const errorMessage = ref('')
const loading = ref(false)

const formSchema = toTypedSchema(z.object({
  email: z
      .string({message: t('common.validations.required')})
      .email({message: t('authentication.validations.email')}),
  password: z.string({message: t('common.validations.required')}),
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true
    const {error} = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })
    if (error) {
      loading.value = false
      throw error
    }
    navigateTo('/')
  } catch (error) {
    errorMessage.value = t('authentication.login.sign_in_failed')
    console.error(error)
  }
})
</script>

<template>
  <div>
    <NuxtLayout name="authentication" :title="$t('authentication.common.sign_in')">

      <form class="space-y-6" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>{{ $t('common.general.email') }}</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="email"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <div class="flex items-center justify-between">
              <FormLabel>
                {{ $t('authentication.common.password') }}
              </FormLabel>
              <Button type="button" variant="link" size="sm" class="h-auto p-0" as-child>
                <NuxtLinkLocale to="password-recovery">
                  {{ $t('authentication.login.forgot_password') }}
                </NuxtLinkLocale>
              </Button>
            </div>
            <FormControl>
              <PasswordInput v-bind="componentField"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>

        <Button type="submit" :loading="loading" class="w-full">
          {{ $t('authentication.common.sign_in') }}
        </Button>

        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

      </form>

      <template #footer>
        {{ $t('authentication.login.no_account') }}
        <Button variant="link" size="sm" class="h-auto p-0 ml-1" as-child>
          <NuxtLinkLocale to="sign-up">
            {{ $t('authentication.login.sign_up_now') }}
            <ArrowRight aria-hidden="true"/>
          </NuxtLinkLocale>
        </Button>
      </template>
    </NuxtLayout>
  </div>
</template>
