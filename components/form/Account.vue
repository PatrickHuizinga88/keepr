<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {Form} from "../ui/form"
import {Info} from "lucide-vue-next"
import type {Database, Tables} from "~/types/database.types";

const props = defineProps<{
  email: string
}>()

const toastStore = useToastStore()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const {t} = useI18n()

const loading = ref(false)
const emailDialogOpen = ref(false)
const passwordDialogOpen = ref(false)
const emailSuccess = ref(false)
const fakePassword = ref('************')
const passwordChangeMessage = ref('')
const loadingPassword = ref(false)

const formSchemaEmail = toTypedSchema(z.object({
  email: z.string().email({
    message: t('authentication.validations.email')
  }),
}))

const formSchemaPassword = toTypedSchema(z.object({
  current_password: z.string().min(6, {
    message: t('authentication.validations.password_length', {length: 6})
  }),
  new_password: z.string().min(6, {
    message: t('authentication.validations.password_length', {length: 6})
  }),
  repeated_password: z.string().min(6, {
    message: t('authentication.validations.password_length', {length: 6})
  }),
}))

const initialValuesEmail = {
  email: props.email,
}

const initialValuesPassword = {
  current_password: '',
  new_password: '',
  repeated_password: '',
}

const onEmailSubmit = async (values: any) => {
  try {
    loading.value = true
    const {error} = await supabase.auth.updateUser({
      email: values.email,
    })
    emailDialogOpen.value = false
    if (error) throw error
    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: t('common.general.email')
    })
    emailSuccess.value = true
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: t('common.general.email')
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onPasswordSubmit = async (values: any) => {
  try {
    loadingPassword.value = true
    if (values.new_password !== values.repeated_password) {
      passwordChangeMessage.value = t('authentication.validations.passwords_dont_match')
      return
    }
    const {data, error: verificationError} = await supabase.rpc('verify_password', {
      current_plain_password: values.current_password,
      current_id: user.value?.id
    })
    if (data === 'incorrect') {
      passwordChangeMessage.value = t('authentication.validations.incorrect_current_password')
      return
    }
    if (verificationError) throw verificationError
    const {error: updateError} = await supabase.auth.updateUser({
      password: values.new_password,
    })
    if (updateError) throw updateError
    passwordChangeMessage.value = ''
    passwordDialogOpen.value = false
    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: t('authentication.common.password'),
    })
  } catch (error) {
    console.error(error)
  } finally {
    loadingPassword.value = false
  }
}
</script>

<template>
  <div class="grid sm:grid-cols-2 gap-6">
    <div>
      <div class="space-y-1.5">
        <Label>{{ $t('common.general.email') }}</Label>
        <Input type="email" placeholder="name@example.com" v-model="props.email" disabled/>
      </div>
      <!-- TODO: Translate alert-->
      <Alert v-if="emailSuccess" variant="info" class="mt-4">
        <Info class="size-4"/>
        <AlertTitle>Confirmation link sent</AlertTitle>
        <AlertDescription>
          Please click on the links sent to your old and new email address to confirm this change.
        </AlertDescription>
      </Alert>
      <Form v-slot="{ handleSubmit }" as="" keep-values :initial-values="initialValuesEmail"
            :validation-schema="formSchemaEmail">
        <Dialog v-model:open="emailDialogOpen">
          <DialogTrigger as-child>
            <Button variant="outline" size="sm" class="w-full mt-4">
              {{ capitalizeSentence($t('common.actions.edit_item', {item: $t('common.general.email')})) }}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{{ capitalizeSentence($t('common.actions.edit_item', {item: $t('common.general.email')})) }}</DialogTitle>
            </DialogHeader>
            <form id="emailForm" @submit="handleSubmit($event, onEmailSubmit)" class="grid gap-4">
              <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                  <FormLabel>{{ $t('common.general.email') }}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" v-bind="componentField"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              </FormField>
              <DialogFooter>
                <Button type="submit" :loading="loading" class="w-full" form="emailForm">
                  {{ capitalizeSentence($t('common.actions.save_item', {item: $t('common.general.email')})) }}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Form>
    </div>
    <div>
      <div class="space-y-1.5">
        <Label>{{ $t('authentication.common.password') }}</Label>
        <Input type="password" v-model="fakePassword" disabled/>
      </div>
      <Form v-slot="{ handleSubmit }" as="" keep-values :initial-values="initialValuesPassword"
            :validation-schema="formSchemaPassword">
        <Dialog v-model:open="passwordDialogOpen">
          <DialogTrigger as-child>
            <Button variant="outline" size="sm" class="w-full mt-4">
              {{ capitalizeSentence($t('common.actions.edit_item', {item: $t('authentication.common.password')}))}}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader class="text-left">
              <DialogTitle>{{
                  capitalizeSentence($t('common.actions.edit_item', {item: $t('authentication.common.password')}))
                }}
              </DialogTitle>
            </DialogHeader>
            <form id="passwordForm" @submit="handleSubmit($event, onPasswordSubmit)" class="space-y-4">
              <FormField v-slot="{ componentField }" name="current_password">
                <FormItem>
                  <FormLabel>{{ $t('account.account_information.current_password') }}</FormLabel>
                  <FormControl>
                    <PasswordInput v-bind="componentField"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="new_password">
                <FormItem>
                  <FormLabel>{{ $t('authentication.password_recovery.new_password') }}</FormLabel>
                  <FormControl>
                    <PasswordInput v-bind="componentField"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="repeated_password">
                <FormItem>
                  <FormLabel>{{ $t('authentication.password_recovery.confirm_password') }}</FormLabel>
                  <FormControl>
                    <PasswordInput v-bind="componentField"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              </FormField>
            </form>

            <p v-if="passwordChangeMessage" class="text-sm text-destructive">{{ passwordChangeMessage }}</p>

            <DialogFooter>
              <Button type="submit" class="w-full" form="passwordForm" :loadng="loadingPassword">
                {{ capitalizeSentence($t('common.actions.save_item', {item: $t('authentication.common.password')})) }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Form>
    </div>
  </div>
</template>