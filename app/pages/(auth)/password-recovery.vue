<script setup lang="ts">
import {ArrowRight} from 'lucide-vue-next'
import Authentication from "~/layouts/authentication.vue";
import {toTypedSchema} from "@vee-validate/zod";
import * as z from "zod";
import {useForm} from "vee-validate";

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const toastStore = useToastStore()
const {t} = useI18n()

useHead({
  title: t('authentication.password_recovery.reset_your_password'),
})

const success = ref(false)
const loading = ref(false)

const formSchema = toTypedSchema(z.object({
  email: z
      .string({message: t('common.validations.required')})
      .email({message: t('authentication.validations.email')}),
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true

    const {public: {baseUrl}} = useRuntimeConfig()
    const {error} = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${baseUrl}/update-password`,
    })
    if (error) throw error

    success.value = true
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      isError: true,
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Authentication :title="$t('authentication.password_recovery.reset_your_password')"
                  :description="$t('authentication.password_recovery.put_in_email')">
    <form v-if="!success" class="space-y-6" @submit="onSubmit">
      <FormField v-slot="{componentField}" name="email">
        <FormItem>
          <FormLabel>{{ $t('common.general.email') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="email"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>

      <Button type="submit" :loading="loading" class="w-full">
        {{ $t('authentication.password_recovery.send_recovery_link') }}
      </Button>
    </form>

    <p v-else class="text-center">
      {{ $t('authentication.password_recovery.password_reset_email_sent') }} <strong>{{ form.values.email }}</strong>.
    </p>

    <template #footer>
      <Button variant="link" size="sm" class="p-0" as-child>
        <NuxtLinkLocale to="login">
          {{ $t('authentication.password_recovery.back_to_sign_in') }}
          <ArrowRight aria-hidden="true"/>
        </NuxtLinkLocale>
      </Button>
    </template>
  </Authentication>
</template>
