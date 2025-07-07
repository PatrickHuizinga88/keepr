<script setup lang="ts">
import {useI18n} from 'vue-i18n'
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
const localePath = useLocalePath()

useHead({
  title: t('authentication.password_recovery.reset_your_password'),
})

const errorMessage = ref('')
const loading = ref(false)

const formSchema = toTypedSchema(z.object({
  new_password: z
      .string({message: t('common.validations.required')})
      .min(8, {message: t('authentication.validations.password_length', {length: 8})}),
  confirm_password: z
      .string({message: t('common.validations.required')})
      .min(8, {message: t('authentication.validations.password_length', {length: 8})}),
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  if (values.new_password !== values.confirm_password) {
    errorMessage.value = t('authentication.password_recovery.passwords_dont_match')
    return
  }
  errorMessage.value = ''

  try {
    loading.value = true
    const {error} = await supabase.auth.updateUser({
      password: values.new_password
    })

    if (error) {
      if (error.code === 'same_password') {
        errorMessage.value = t('authentication.password_recovery.same_password')
        return
      }
      toastStore.createToast({
        type: 'destructive',
        isError: true,
      })
      console.error(error)
      return
    }
    await navigateTo(localePath('login'))
    toastStore.createToast({
      type: 'success',
      action: 'update',
      item: t('authentication.common.password'),
    })
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
  <Authentication :title="$t('authentication.password_recovery.reset_your_password')">
    <form class="space-y-6" @submit="onSubmit">
      <FormField v-slot="{componentField}" name="new_password">
        <FormItem>
          <FormLabel>{{ $t('authentication.password_recovery.new_password') }}</FormLabel>
          <FormControl>
            <PasswordInput v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>

      <FormField v-slot="{componentField}" name="confirm_password">
        <FormItem>
          <FormLabel>{{ $t('authentication.password_recovery.confirm_password') }}</FormLabel>
          <FormControl>
            <PasswordInput v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>

      <Button type="submit" :loading="loading" class="w-full">
        {{ t('authentication.password_recovery.update_password') }}
      </Button>

      <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
    </form>
  </Authentication>
</template>
