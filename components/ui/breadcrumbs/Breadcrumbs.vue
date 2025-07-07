<script setup lang="ts">
import {ChevronRight} from 'lucide-vue-next'

interface Breadcrumb {
  title: string
  link?: string
}

const props = defineProps<{
  overwrittenRoute?: string
}>()

const breadcrumbs = computed(() => {
  const fullPath = useRoute().fullPath.split('?')[0]
  const params = fullPath.startsWith('/') ? fullPath.substring(1).split('/') : fullPath.split('/')
  const crumbs: Breadcrumb[] = [
    {
      title: 'Dashboard',
      link: fullPath !== '/' ? '/' : undefined
    }
  ]

  let path = ''

  params.forEach(param => {
    if (param === '') return
    path = `${path}/${param}`
    const isCurrentRoute = path === useRoute().path

    crumbs.push({
      title: isCurrentRoute && props.overwrittenRoute ? props.overwrittenRoute : capitalize(param.replace(/-/g, ' ')),
      link: isCurrentRoute ? undefined : path
    })
  })
  return crumbs
})
</script>

<template>
  <nav class="hidden lg:block" :aria-label="$t('common.general.breadcrumbs')">
    <ol v-if="breadcrumbs.length" class="flex items-center space-x-3">
      <li v-for="(crumb, index) in breadcrumbs">
        <div class="flex items-center">
          <NuxtLinkLocale :to="crumb.link"
                    :class="[{ 'text-muted-foreground hover:text-foreground': crumb.link }, { 'font-medium': index === breadcrumbs.length - 1 }, { 'mr-3': breadcrumbs.length > 1 }]">
            {{ crumb.title }}
          </NuxtLinkLocale>
          <ChevronRight v-if="index !== breadcrumbs.length - 1" class="size-4 flex-shrink-0 text-muted-foreground"
                        role="presentation" aria-hidden="true"/>
        </div>
      </li>
    </ol>
  </nav>
</template>