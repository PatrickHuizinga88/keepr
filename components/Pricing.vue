<script setup lang="ts">
import {Separator} from "~/components/ui/separator";
import {CheckCircle} from "lucide-vue-next";
import type {Database} from "~/types/database.types";

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toastStore = useToastStore()
const {t} = useI18n()
const loading = ref('')

const currency = 'EUR'

// TODO - Setup: Configure or remove plans
const plans = [
  {
    name: 'Free plan',
    description: 'Perfect for small teams that want to get started with our product.',
    pricing: '0',
    featuresTitle: 'Included features:',
    features: [
      { name: 'Customers analytics & insight' },
      { name: '5 users' },
      { name: 'Basic support' },
    ],
    highlighted: false,
    isCurrentPlan: true,
  },
  {
    lookupKey: 'premium_monthly',
    name: 'Premium plan',
    description: 'Better for growing teams that want to scale their business.',
    pricing: '29',
    featuresTitle: 'Everything in Free plan, plus:',
    features: [
      { name: 'Advanced analytics & insights' },
      { name: 'Unlimited users' },
      { name: 'Priority support' },
      { name: 'Custom branding' },
    ],
    highlighted: true,
    isCurrentPlan: false,
  }
]

const {data: profile} = await useAsyncData('profile', async () => {
  const {data} = await supabase.from('profiles')
      .select('plan')
      .eq('user_id', user.value?.id)
      .single()
  return data
})

const actionText = (lookupKey: string) => {
  if (profile.value.plan === lookupKey) {
    return t('pricing.current_plan')
  }

  return t('pricing.upgrade')
}

const checkout = async (lookupKey?: string) => {
  try {
    loading.value = lookupKey || ''
    const url = await $fetch('/api/stripe/create-checkout-session', {
      query: {
        lookupKey,
        stripeCustomerId: user.value?.user_metadata.stripe_customer_id
      }
    })

    if (!url) {
      throw new Error('Failed to create checkout session')
    }

    if (url) {
      navigateTo(url, {
        external: true,
      })
    }
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      isError: true,
    })
    console.error(error)
  } finally {
    loading.value = ''
  }
}
</script>

<template>
  <div class="grid sm:grid-cols-2 gap-6">
    <div v-for="plan in plans" :class="['flex flex-col bg-background border rounded-2xl p-6', {'border-2 border-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)]': plan.highlighted}]">
      <h3 class="font-bold mb-2">{{ plan.name }}</h3>
      <p class="text-muted-foreground text-sm">{{ plan.description }}</p>
      <div class="flex text-5xl font-semibold mt-6">
        {{ (currency === 'EUR' ? '€' : '$') + plan.pricing }}
        <span class="text-base text-muted-foreground ml-1">
          {{ currency === 'EUR' ? 'EUR' : 'US' }}
        </span>
      </div>
      <Separator class="w-full my-6"/>
      <h3 class="text-sm text-muted-foreground mb-3">{{ plan.featuresTitle }}</h3>
      <ul class="space-y-3 text-sm">
        <li v-for="feature in plan.features" class="flex items-center font-medium">
          <CheckCircle class="size-4 mr-2 shrink-0"/>
          {{ feature.name }}
        </li>
      </ul>
      <div class="mt-auto">
        <Button
            v-if="plan.lookupKey"
            size="lg"
            class="w-full sm:w-auto mt-6"
            :loading="loading === plan.lookupKey"
            :disabled="profile.plan === plan.lookupKey"
            @click="checkout(plan.lookupKey)">
          {{ actionText(plan.lookupKey) }}
        </Button>
        <Button
            v-else-if="!plan.lookupKey && profile.plan === 'free'"
            variant="outline"
            size="lg"
            class="w-full sm:w-auto mt-6"
            disabled>
          {{ t('pricing.current_plan') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>