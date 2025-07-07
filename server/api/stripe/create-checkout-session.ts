import {stripe} from "~/server/utils/stripe";

interface Query {
  stripeCustomerId: string
  lookupKey: string
}

export default defineEventHandler(async (event) => {
  const { stripeCustomerId, lookupKey } = getQuery<Query>(event)
  const { public: {baseUrl} } = useRuntimeConfig()

  if (!lookupKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Lookup key is required',
    })
  }

  if (!stripeCustomerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stripe customer ID is required',
    })
  }

  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    expand: ['data.product'],
  })

  const {url} = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data[0].id,
        quantity: 1,
      }
    ],
    mode: 'subscription',
    success_url: `${baseUrl}/pricing?success=true`,
    cancel_url: `${baseUrl}/pricing?success=false`,
  })

  return url
})