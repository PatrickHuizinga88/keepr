<script setup lang="ts">
import {StatCard} from "~/components/ui/stat-card";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";
import {Avatar, AvatarFallback} from "~/components/ui/avatar";
import {ArrowRight} from 'lucide-vue-next';
import {Page} from "../components/ui/page";
import type {Database} from "~/types/database.types";

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toastStore = useToastStore()
const {t, locale} = useI18n()
const localePath = useLocalePath()
const dayjs = useDayjs()

useHead({
  title: t("common.navigation.dashboard"),
})

const {data: profile} = await useAsyncData('profile', async () => {
  if (!user.value) return
  const {data, error} = await supabase.from('profiles')
      .select('*')
      .eq('user_id', user.value.id)
      .single()
  if (error) throw error
  return data
})

const {data: statistics} = await useLazyAsyncData('statistics', async () => {
  if (!user.value) return
  try {
    const {count: customersCount, error: customersCountError} = await supabase.from('customers')
        .select('*', {count: 'exact', head: true})
    if (customersCountError) throw customersCountError

    const lastSignIn = capitalize(dayjs(user.value.last_sign_in_at).locale(locale).fromNow())

    const {data: recentCustomers, error: recentCustomersError} = await supabase.from('customer')
        .select('id,first_name,last_name,created_at')
        .order('created_at', {ascending: false})
        .limit(4)
    if (recentCustomersError) throw recentCustomersError

    return {
      customersCount,
      lastSignIn,
      recentCustomers,
    }
  } catch (error) {
    toastStore.createToast({
      type: 'destructive',
      action: 'retrieve',
      item: t('dashboard.statistics')
    })
    console.error(error)
  }
})

const initials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}
</script>

<template>
  <Page :title="`${$t('dashboard.welcome')}, ${profile?.first_name || 'common.general.guest'}! 👋`">
    <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <StatCard :title="$t('customers.customers', 2)" :stat="statistics.customersCount" :difference="12.5"
                :subtitle="lowercase($t('dashboard.compared_to_last_week'))"/>
      <StatCard :title="$t('users.users', 2)" :stat="10"/>
      <StatCard :title="$t('dashboard.last_sign_in')"
                :stat="statistics.lastSignIn"/>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-3 gap-4 mb-4">
      <Card class="col-span-full xl:col-span-2">
        <CardHeader>
          <CardTitle>{{ $t('dashboard.revenue_history') }}</CardTitle>
        </CardHeader>
        <div class="mt-5">
          <!-- TODO: Add graph -->
          <div class="flex items-center justify-center h-40 text-muted-foreground text-sm">
            {{ $t('dashboard.no_data') }}
          </div>
        </div>
      </Card>
      <Card class="col-span-1 md:col-span-2 xl:col-span-1">
        <CardHeader>
          <div>
            <CardTitle>{{ $t('dashboard.recent_registered_customers') }}</CardTitle>
            <CardDescription>{{ $t('dashboard.in_the_last_30_days') }}</CardDescription>
          </div>
          <CardAction>
            <Button variant="ghost" size="sm" as-child>
              <NuxtLinkLocale to="customers">
                {{ $t('dashboard.view_all') }}
                <ArrowRight ria-hidden="true"/>
              </NuxtLinkLocale>
            </Button>
          </CardAction>
        </CardHeader>
        <ul class="space-y-4">
          <li v-for="customer in statistics?.recentCustomers" class="flex items-center">
            <Avatar>
              <AvatarFallback>{{initials(customer.first_name, customer.last_name)}}</AvatarFallback>
            </Avatar>
            <div class="text-sm ml-4">
              <NuxtLink :to="localePath({name: 'customers-id', params: {id: customer.id}})"
                        class="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {{`${customer.first_name} ${customer.last_name}`}}
              </NuxtLink>
              <div class="text-muted-foreground">{{ $dayjs(customer.created_at).locale(locale).fromNow() }}</div>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  </Page>
</template>
