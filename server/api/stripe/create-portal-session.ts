import {stripe} from "~/server/utils/stripe";

interface Query {
  stripeCustomerId: string
}

export default defineEventHandler(async (event) => {
  const {stripeCustomerId} = getQuery<Query>(event)
  const {public: {baseUrl}} = useRuntimeConfig()

  if (!stripeCustomerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stripe customer ID is required',
    })
  }

  const {url} = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/account`,
  })

  return url
})