<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";
import type {Database, Tables} from "~/types/database.types";

const props = defineProps<{
  customer?: Tables<'customers'>
}>()

const toastStore = useToastStore()
const supabase = useSupabaseClient<Database>()
const localePath = useLocalePath()

const formSchema = toTypedSchema(z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}))

const form = useForm({
  initialValues: {
    first_name: props.customer?.first_name,
    last_name: props.customer?.last_name,
    email: props.customer?.email,
    phone_number: props.customer?.phone_number,
    address: props.customer?.address,
    postal_code: props.customer?.postal_code,
    city: props.customer?.city,
    country: props.customer?.country,
  },
  validationSchema: formSchema,
})

const loading = ref(false)

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true
    const {data, error} = await supabase.from('customers').upsert({
      id: props.customer?.id,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone_number: values.phone_number,
      address: values.address,
      postal_code: values.postal_code,
      city: values.city,
      country: values.country,
    }, {
      onConflict: 'id'
    }).select()
    if (error) throw error
    await navigateTo(localePath({name: 'customers-id', params: {id: data[0].id}}))
    toastStore.createToast({
      type: 'success',
      action: 'save',
      item: `${values.first_name} ${values.last_name}`
    })
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'save',
      item: `${values.first_name} ${values.last_name}`
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="first_name">
        <FormItem>
          <FormLabel>{{ $t('customers.first_name') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="last_name">
        <FormItem>
          <FormLabel>{{ $t('customers.last_name') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>{{ $t('common.general.email') }}</FormLabel>
          <FormControl>
            <Input type="email" v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="phone_number">
        <FormItem>
          <FormLabel>{{ $t('customers.phone_number') }}</FormLabel>
          <FormControl>
            <Input type="tel" v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>
    <FormField v-slot="{ componentField }" name="address">
      <FormItem>
        <FormLabel>{{ $t('customers.address') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="city">
        <FormItem>
          <FormLabel>{{ $t('customers.city') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="country">
        <FormItem>
          <FormLabel>{{ $t('customers.country') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>
    <div class="grid sm:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="state">
        <FormItem>
          <FormLabel>{{ $t('customers.state') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="postal_code">
        <FormItem>
          <FormLabel>{{ $t('customers.postal_code') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      </FormField>
    </div>

    <Button :loading="loading" class="w-full lg:w-auto">
      {{ capitalizeSentence($t('common.actions.save_item', {item: $t('customers.customers')})) }}
    </Button>
  </form>
</template>