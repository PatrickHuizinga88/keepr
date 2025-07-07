import Stripe from 'stripe'

export const stripe = new Stripe(useRuntimeConfig().stripeSecretKey, {
  typescript: true,
})