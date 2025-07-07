<script setup lang="ts">
import {Switch} from "~/components/ui/switch";
import {ChevronsUpDown, Info} from "lucide-vue-next";

const {public: {baseUrl}} = useRuntimeConfig()

const showBanner = ref(false)

const necessaryCookies = ref(true)
const functionalCookies = ref(false)

const accept = () => {
  showBanner.value = false
  console.log("All cookies accepted")
}

const decline = () => {
  showBanner.value = false
  console.log("All cookies declined")
}

const savePreferences = () => {
  showBanner.value = false
  console.log('Preferences saved:', {
    necessary: necessaryCookies.value,
    functional: functionalCookies.value,
  })
}

onMounted(() => {
  // Check if the user has already accepted or declined cookies
  showBanner.value = true
})
</script>

<template>
  <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
  >
    <div v-if="showBanner"
         class="fixed bottom-4 left-4 right-4 sm:right-auto sm:w-full sm:max-w-sm bg-background rounded-xl shadow-[0_0_50px_-8px_#0004] p-4">
      <h1 class="text-xl mb-2">{{ $t('legal.cookie_consent.title') }}</h1>
      <p class="text-sm text-muted-foreground mb-4">
        {{ $t('legal.cookie_consent.description') }}
      </p>
      <div class="flex gap-2 w-full">
        <Button @click="accept" size="sm">{{ $t('legal.cookie_consent.accept') }}</Button>
        <Button @click="decline" variant="outline" size="sm">{{ $t('legal.cookie_consent.decline') }}</Button>
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="ghost" size="sm" class="ml-auto">{{ $t('legal.cookie_consent.manage_preferences') }}</Button>
          </DialogTrigger>
          <DialogContent class="max-w-xl grid-rows-[auto_minmax(0,1fr)_auto] p-0 h-[90dvh] sm:h-auto">
            <DialogHeader class="p-6 pb-0">
              <DialogTitle>
                {{ $t('legal.cookie_consent.preferences_dialog.title') }}
              </DialogTitle>
              <DialogDescription>
                {{ $t('legal.cookie_consent.preferences_dialog.description') }}
              </DialogDescription>
            </DialogHeader>
            <div class="space-y-2 overflow-y-auto px-6 py-4">
              <Collapsible class="bg-muted/50 rounded-lg -mx-2">
                <div class="flex justify-between items-center pr-4 pl-2 py-2">
                  <CollapsibleTrigger class="group flex items-center w-full" tabindex="-1">
                    <Button variant="ghost" size="icon-sm" class="mr-2 group-hover:bg-muted" :aria-label="$t('legal.cookie_consent.preferences_dialog.necessary.toggle_details')">
                      <ChevronsUpDown/>
                    </Button>
                    <h2 id="necessary-cookies-label" class="text-lg">
                      {{ $t('legal.cookie_consent.preferences_dialog.necessary.title') }}
                    </h2>
                  </CollapsibleTrigger>
                  <Switch v-model="necessaryCookies" id="necessary-cookies" aria-labelledby="necessary-cookies-label"
                          disabled/>
                </div>
                <CollapsibleContent class="p-4 pt-2">
                  <p class="text-sm text-muted-foreground">
                    {{ $t('legal.cookie_consent.preferences_dialog.necessary.description') }}
                  </p>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible class="bg-muted/50 rounded-lg -mx-2">
                <div class="flex justify-between items-center pr-4 pl-2 py-3">
                  <CollapsibleTrigger class="group flex items-center w-full" tabindex="-1">
                    <Button variant="ghost" size="icon-sm" class="mr-2 group-hover:bg-muted" :aria-label="$t('legal.cookie_consent.preferences_dialog.functional.toggle_details')">
                      <ChevronsUpDown/>
                    </Button>
                    <h2 id="functional-cookies-label" class="text-lg">
                      {{ $t('legal.cookie_consent.preferences_dialog.functional.title') }}
                    </h2>
                  </CollapsibleTrigger>
                  <Switch v-model="functionalCookies" id="functional-cookies" aria-labelledby="functional-cookies-label"/>
                </div>
                <CollapsibleContent class="p-4 pt-2">
                  <p class="text-sm text-muted-foreground">
                    {{ $t('legal.cookie_consent.preferences_dialog.functional.description') }}
                  </p>
                </CollapsibleContent>
              </Collapsible>
              <Alert class="!mt-8">
                <Info class="size-4"/>
                <AlertTitle>{{ $t('legal.cookie_consent.preferences_dialog.more_information.title') }}</AlertTitle>
                <AlertDescription class="text-muted-foreground">
                  {{ $t('legal.cookie_consent.preferences_dialog.more_information.description') }}
                  <a :href="`${baseUrl}/privacy-policy`" target="_blank" class="underline">{{ $t('legal.privacy_policy.privacy_policy') }}</a>.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter class="p-6 pt-0">
              <div class="grid sm:grid-cols-3 gap-2 w-full">
                <Button @click="accept" variant="outline" size="sm" class="w-full">
                  {{ $t('legal.cookie_consent.preferences_dialog.accept_all') }}
                </Button>
                <Button @click="decline" variant="outline" size="sm" class="w-full">
                  {{ $t('legal.cookie_consent.preferences_dialog.decline_all') }}
                </Button>
                <Button @click="savePreferences" size="sm" class="w-full">
                  {{ $t('legal.cookie_consent.preferences_dialog.save_preferences') }}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </transition>
</template>

<style scoped>

</style>