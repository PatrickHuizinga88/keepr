<script setup lang="ts">
import {ArrowRight, CheckCircle} from 'lucide-vue-next'
import Authentication from "~/layouts/authentication.vue";
import {useForm} from "vee-validate";
import {toTypedSchema} from "@vee-validate/zod";
import * as z from 'zod'

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const {t} = useI18n()

useHead({
  title: t('authentication.register.sign_up'),
})

const errorMessage = ref('')
const success = ref(false)
const resendDelay = ref(10)
const loading = ref(false)

const countDown = () => {
  const interval = setInterval(() => {
    resendDelay.value--
    if (resendDelay.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

const formSchema = toTypedSchema(z.object({
  email: z
      .string({message: t('common.validations.required')})
      .email({message: t('authentication.validations.email')}),
  password: z
      .string({message: t('common.validations.required')})
      .min(8, {message: t('authentication.validations.password_length', {length: 8})}),
  repeated_password: z
      .string({message: t('common.validations.required')})
      .min(8, {message: t('authentication.validations.password_length', {length: 8})}),
}))

const form = useForm({
  validationSchema: formSchema,
})

const signUp = async (email: string, password: string) => {
  const {public: {baseUrl}} = useRuntimeConfig()

  const {id: customerId} = await $fetch<any>('/api/stripe/create-customer', {
    query: {email: email}
  })
  if (!customerId) throw new Error('Failed to create customer')

  const {error} = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        stripe_customer_id: customerId,
      },
      emailRedirectTo: `${baseUrl}/intro`
    }
  })
  if (error) throw error

  resendDelay.value = 20
  countDown()
}

const onSubmit = form.handleSubmit(async (values) => {
  if (values.password !== values.repeated_password) {
    errorMessage.value = t('authentication.validations.passwords_dont_match')
    return
  }

  try {
    loading.value = true
    await signUp(values.email, values.password)

    success.value = true
  } catch (error) {
    errorMessage.value = t('authentication.register.sign_up_failed')
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Authentication :title="$t('authentication.register.create_new_account')">
    <form v-show="!success" class="space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" :validate-on-model-update="false" name="email">
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
          <FormLabel>{{ $t('authentication.common.password') }}</FormLabel>
          <FormControl>
            <PasswordInput v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="repeated_password">
        <FormItem>
          <FormLabel>{{ $t('authentication.register.repeat_password') }}</FormLabel>
          <FormControl>
            <PasswordInput v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>

      <Button type="submit" :loading="loading" class="w-full">
        {{ $t('authentication.register.sign_up') }}
      </Button>

      <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
    </form>

    <div v-if="success" class="flex flex-col items-center">
      <Alert variant="success">
        <CheckCircle class="size-4"/>
        <AlertTitle>{{ $t('authentication.register.sign_up_success.title') }}</AlertTitle>
        <AlertDescription>{{
            $t('authentication.register.sign_up_success.description', {email: form.values.email})
          }}
        </AlertDescription>
      </Alert>

      <p class="text-sm text-muted-foreground text-center mt-4">
        {{ $t('authentication.register.received_nothing') }}
        <Button @click="signUp(form.values.email, form.values.password)" variant="link" class="h-auto p-0 text-primary"
                :disabled="resendDelay > 0">
          {{ $t('authentication.register.send_again') }}
        </Button>
        <span v-if="resendDelay > 0" class="inline-block ml-1">
          {{ $t('authentication.register.in_seconds', {seconds: resendDelay}) }}
        </span>
      </p>
    </div>

    <template v-if="!success" #footer>
      {{ $t('authentication.register.have_account') + ' ' }}
      <Button variant="link" size="sm" class="h-auto p-0 ml-1" as-child>
        <NuxtLinkLocale to="login">
          {{ $t('authentication.common.sign_in') }}
          <ArrowRight aria-hidden="true"/>
        </NuxtLinkLocale>
      </Button>
    </template>
  </Authentication>
</template>
