<script setup lang="ts">
import {Page} from "../components/ui/page";
import {Dialog, DialogHeader, DialogTitle, DialogFooter} from "~/components/ui/dialog";

const user = useSupabaseUser()
const route = useRoute()
const {t} = useI18n()

useHead({
  title: t('pricing.choose_your_plan'),
})

const open = ref(false)
const transactionSuccess = ref(false)

// TODO: Implement more robust way to handle transaction status
onMounted(async () => {
  if (!route.query.success) {
    return
  }

  if (route.query.success === 'true') {
    await $fetch('/api/stripe/update-subscription', {
      query: {
        stripeCustomerId: user.value?.user_metadata.stripe_customer_id
      }
    })
    transactionSuccess.value = true
  }

  if (route.query.success === 'false') {
    transactionSuccess.value = false
  }

  open.value = true
})
</script>

<template>
  <h1>{{ $t('pricing.choose_your_plan') }}</h1>
  <Pricing/>
  <Dialog v-model:open="open">
    <DialogContent class="text-center">
      <DialogHeader>
        <DialogTitle class="text-center">
          {{
            transactionSuccess ?
                $t('pricing.upgrade_confirmation.title.success') :
                $t('pricing.upgrade_confirmation.title.error')
          }}
        </DialogTitle>
      </DialogHeader>
      <p>{{
          transactionSuccess ?
              $t('pricing.upgrade_confirmation.description.success') :
              $t('pricing.upgrade_confirmation.description.error')
        }}</p>
      <DialogFooter>
        <Button @click="open = false" :variant="transactionSuccess ? 'default' : 'outline'" class="w-full">
          {{
            transactionSuccess ?
                $t('pricing.upgrade_confirmation.action.success') :
                $t('pricing.upgrade_confirmation.action.error')
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>