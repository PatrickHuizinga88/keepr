<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";
import type {Database} from "~/types/database.types";
import {Info} from "lucide-vue-next";

const props = defineProps<{
  user?: {
    user_id: string,
    first_name: string,
    last_name: string,
    email: string,
    role: string
  }
  invite?: boolean
}>()

const supabase = useSupabaseClient<Database>()
const toastStore = useToastStore()
const {t} = useI18n()
const localePath = useLocalePath()

const roleOptions = [
  {value: 'admin', label: t('users.roles.admin'), description: t('users.roles.admin_description')},
  {value: 'editor', label: t('users.roles.editor'), description: t('users.roles.editor_description')},
  {value: 'viewer', label: t('users.roles.viewer'), description: t('users.roles.viewer_description')},
]

const formSchema = toTypedSchema(z.object({
  first_name: z.string({
    message: t('common.validations.required')
  }).min(2, {
    message: t('common.validations.min_length.string', {min: 2})
  }).max(50, {
    message: t('common.validations.max_length.string', {max: 50})
  }),
  last_name: z.string({
    message: t('common.validations.required')
  }).min(2, {
    message: t('common.validations.min_length.string', {min: 2})
  }).max(50, {
    message: t('common.validations.max_length.string', {max: 50})
  }),
  email: z.string({
    message: t('common.validations.required')
  }).email({
    message: t('common.validations.invalid_string.email')
  }),
  role: z.enum(['admin', 'editor', 'viewer'], {
    message: t('common.validations.required'),
  }),
}))

const form = useForm({
  initialValues: {
    first_name: props.user?.first_name,
    last_name: props.user?.last_name,
    email: props.user?.email,
    role: props.user?.role,
  },
  validationSchema: formSchema,
})

const loading = ref(false)

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true

    let newUserId

    if (props.invite) {
      const { id } = await $fetch('/api/invite-user', {
        method: 'POST',
        body: {
          email: values.email,
          firstName: values.first_name,
        }
      })
      if (!id) throw new Error('Could not invite user')

      newUserId = id
    }

    const {error: profileError} = await supabase.from('profiles')
        .upsert({
          user_id: props.user?.user_id || newUserId,
          first_name: values.first_name,
          last_name: values.last_name,
        }, {
          onConflict: 'user_id'
        })
    if (profileError) throw profileError

    const {error: userRoleError} = await supabase.from('user_roles')
        .upsert({
          user_id: props.user?.user_id || newUserId,
          role: values.role,
        }, {
          onConflict: 'user_id'
        })
    if (userRoleError) throw userRoleError

    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: `${values.first_name} ${values.last_name}`,
    })

    if (!props.invite) {
      await navigateTo(localePath({name: 'users-id', params: {id: props.user?.user_id}}))
      return
    }

    emit('submit')
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: `${values.first_name} ${values.last_name}`,
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})

const emit = defineEmits(['submit'])
</script>

<template>
  <form @submit="onSubmit" class="@container grid gap-y-6">
    <div class="grid sm:grid-cols-2 gap-4">
      <FormField v-slot="{ componentField }" name="first_name">
        <FormItem>
          <FormLabel>{{ $t('account.profile.first_name') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="last_name">
        <FormItem>
          <FormLabel>{{ $t('account.profile.last_name') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>{{ $t('common.general.email') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="email" :disabled="!props.invite"/>
        </FormControl>
        <FormDescription v-if="!props.invite">{{ $t('users.email_description') }}</FormDescription>
        <FormMessage/>
      </FormItem>
    </FormField>

    <div class="flex flex-col @lg:flex-row @lg:items-end gap-2">
      <FormField v-slot="{ componentField }" name="role">
        <FormItem class="w-full">
          <FormLabel>{{ $t('users.role') }}</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full @lg:mb-0">
                <SelectValue :placeholder="$t('users.select_role')"/>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="option in roleOptions" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage/>
        </FormItem>
      </FormField>

      <Dialog>
        <DialogTrigger as-child>
          <Button variant="secondary" class="w-full @lg:w-auto">
            <Info/>
            {{ $t('users.role_info.title') }}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ $t('users.role_info.title') }}</DialogTitle>
            <DialogDescription>
              {{ $t('users.role_info.description') }}
            </DialogDescription>
          </DialogHeader>
          <ul class="space-y-4">
            <li v-for="option in roleOptions" :key="option.value">
              <div class="h4">{{ option.label }}</div>
              <p class="text-sm">{{ option.description }}</p>
            </li>
          </ul>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">
                {{ $t('common.actions.close') }}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <Button :loading="loading" class="w-full lg:w-auto justify-self-end">
      {{ capitalizeSentence($t(`common.actions.${props.invite ? 'invite' : 'save'}_item`, {item: $t('users.users')})) }}
    </Button>
  </form>
</template>