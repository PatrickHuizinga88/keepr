<script setup lang="ts">
import {ExternalLink} from "lucide-vue-next";
import type {Database} from "~/types/database.types";
import {SUPPORT_EMAIL as supportEmail} from "~/constants";

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const {t} = useI18n()
const toastStore = useToastStore()

useHead({
  title: t("account.account"),
})

const {data: profile} = await useAsyncData('accountProfile', async () => {
  const {data} = await supabase.from('profiles')
      .select('name,plan')
      .eq('user_id', user.value?.id)
      .single()
  return data
})

const navigateToStripeDashboard = async () => {
  try {
    const url = await $fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      query: {
        stripeCustomerId: user.value?.user_metadata.stripe_customer_id
      }
    })
    if (!url) throw new Error('Failed to create portal session')

    await navigateTo(url, {
      external: true,
    })
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      isError: true,
    })
    console.error(error)
  }
}
</script>

<template>
  <div class="container">
    <h1 class="my-8">{{ $t('account.account') }}</h1>

    <section id="profile-information">
      <h2 class="h3 mb-4">{{ $t('account.profile.profile_information') }}</h2>
      <FormProfile v-if="profile" :name="profile.name"/>
    </section>

    <Separator class="w-full my-12"/>

    <section id="account-information">
      <h2 class="h3 mb-4">{{ $t('account.account_information.account_information') }}</h2>
      <FormAccount v-if="user" :email="user.email"/>
    </section>

    <Separator class="w-full my-12"/>

    <section id="billing">
      <h2 class="h3 mb-4">{{ $t('account.billing.billing') }}</h2>
      <div class="grid sm:grid-cols-2 gap-6">
        <div class="space-y-1.5">
          <Label id="plan-label" as="span">{{ $t('account.billing.current_plan') }}</Label>
          <span class="block text-lg font-semibold text-primary"
                aria-describedby="plan-label">{{ $t(`pricing.plans.${profile.plan}`) }}</span>
        </div>
        <div class="space-y-3">
          <Dialog>
            <DialogTrigger as-child>
              <Button variant="outline" size="sm" class="w-full">
                {{ $t('account.billing.view_plans') }}
              </Button>
            </DialogTrigger>
            <DialogContent class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90dvh] sm:max-w-3xl p-0">
              <DialogHeader class="p-6 pb-0">
                <DialogTitle>{{ $t('account.billing.view_plans') }}</DialogTitle>
              </DialogHeader>
              <Pricing class="overflow-y-auto p-6 pb-2"/>
              <DialogFooter class="p-6 pt-0">
                <DialogClose as-child>
                  <Button variant="outline">
                    {{ $t('common.actions.close') }}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button v-if="profile.plan !== 'free'" variant="outline" size="sm" @click="navigateToStripeDashboard()"
                  class="w-full">
            {{ $t('account.billing.manage_subscription') }}
            <ExternalLink/>
          </Button>
        </div>
      </div>

    </section>

    <Separator class="w-full my-12"/>

    <section id="preferences">
      <h2 class="h3 mb-4">{{ $t('account.preferences.preferences') }}</h2>
      <FormPreferences/>
    </section>

    <Separator class="w-full my-12"/>

    <section id="danger-zone">
      <h2 class="h3 text-destructive mb-2">{{ $t('account.danger_zone.danger_zone') }}</h2>
      <!-- TODO - Setup: Change support email -->
      <p class="text-muted-foreground text-sm mb-6">{{ $t('account.danger_zone.explanation') }} <a
          :href="`mailto:${supportEmail}`" class="text-primary-dark underline">{{ supportEmail }}</a>.</p>
      <!--    <p class="text-muted-foreground text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>-->
      <!--          <Button variant="outline" size="sm">-->
      <!--            <Trash class="size-4"/>-->
      <!--            {{ $t('account.anger_zone.delete_account') }}-->
      <!--          </Button>-->
    </section>
  </div>
</template>

<style scoped>

</style>