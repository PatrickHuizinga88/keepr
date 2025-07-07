<script setup lang="ts">
import {Home, IdCard, LogOut, User, Users, Settings, MessageSquare, ArrowBigUp, ChevronsUpDown} from "lucide-vue-next";
import type {Database} from "~/types/database.types";
import {DropdownMenu, DropdownMenuTrigger} from "~/components/ui/dropdown-menu";
import FeedbackDialog from "~/components/FeedbackDialog.vue";

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const userStore = useUserStore()
const {t} = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const navigation = [
  {
    name: t('common.navigation.general'),
    allowed_roles: ['admin', 'editor', 'viewer'],
    links: [
      {name: t('common.navigation.dashboard'), url: '/', icon: Home},
      {name: t('customers.customers', 2), url: 'customers', icon: IdCard},
    ]
  },
  {
    name: t('common.navigation.management'),
    allowed_roles: ['admin'],
    links: [
      {name: t('users.users', 2), url: 'users', icon: Users},
      {name: t('settings.settings', 2), url: 'settings', icon: Settings},
    ]
  }
]

const {data: profile} = await useLazyAsyncData('navigationProfile', async () => {
  const {data} = await supabase.from('profiles')
      .select('first_name,last_name,plan')
      .eq('user_id', user.value?.id)
      .single()
  return data
})

const initials = computed(() => {
  if (!profile.value) return ''
  return profile.value.first_name.charAt(0) + profile.value.last_name.charAt(0)
})

const filteredNavigation = computed(() => {
  return navigation.filter(category => {
    return userStore.role && category.allowed_roles.includes(userStore.role)
  })
})

const isCurrentOrChildRoute = (path: string) => {
  if (path === '/') {
    return route.path === path ? 'bg-foreground/5' : ''
  }
  return route.fullPath.includes(path) ? 'bg-foreground/5' : ''
}

const signOut = async () => {
  const {error} = await supabase.auth.signOut()
  if (!error) {
    await navigateTo(localePath('login'))
  }
}
</script>

<template>
  <nav class="flex flex-1 flex-col">
    <ul role="list" class="flex flex-1 flex-col space-y-6">
      <li v-for="category in filteredNavigation" :key="category.name">
        <div class="text-xs font-medium leading-6 text-muted-foreground">{{ category.name }}</div>
        <ul role="list" class="-mx-2 mt-2 space-y-1">
          <li v-for="link in category.links" :key="link.name">
            <Button as-child variant="ghost" size="sm" class="w-full justify-start font-normal hover:bg-foreground/5 px-2">
              <NuxtLinkLocale :to="link.url" active-class="bg-foreground/5" :class="isCurrentOrChildRoute(link.url)">
                <component :is="link.icon" class="shrink-0" aria-hidden="true"/>
                <span class="truncate">{{ link.name }}</span>
              </NuxtLinkLocale>
            </Button>
          </li>
        </ul>
      </li>
    </ul>

    <ul role="list" class="-mx-2 mt-auto space-y-1">
      <li v-if="profile && profile.plan === 'free'" class="!mb-5 starting:opacity-0 starting:scale-95 duration-300">
        <NuxtLinkLocale to="pricing"
                  class="group relative flex bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-lg px-2 py-4 no-underline">
          <div
              class="absolute inset-0 bg-background opacity-25 dark:opacity-50 group-hover:opacity-0 dark:group-hover:opacity-25 duration-300"></div>
          <ArrowBigUp class="relative size-5 shrink-0 mr-2" aria-hidden="true"/>
          <div class="relative text-sm">
            <span class="block font-semibold mb-1">{{ $t('pricing.upgrade_now') }}</span>
            {{ $t('pricing.check_our_pricing_model') }}
          </div>
        </NuxtLinkLocale>
      </li>
      <li>
        <FeedbackDialog/>
      </li>
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="lg" class="w-full justify-start hover:bg-foreground/5 p-2">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarFallback class="rounded-lg">
                  <template v-if="initials">
                    {{ initials }}
                  </template>
                  <User v-else class="size-5"/>
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">
                  <template v-if="profile">{{ `${profile.first_name} ${profile.last_name}` }}</template>
                  <template v-else>{{ user.email }}</template>
                </span>
              </div>
              <ChevronsUpDown class="ml-auto !size-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="min-w-56 rounded-lg">
            <DropdownMenuGroup>
              <DropdownMenuItem as-child>
                <NuxtLinkLocale to="account">
                  <User/>
                  {{ $t('authentication.common.account') }}
                </NuxtLinkLocale>
              </DropdownMenuItem>
              <DropdownMenuItem @click="signOut">
                <LogOut/>
                {{ $t('authentication.common.sign_out') }}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </ul>
  </nav>
</template>