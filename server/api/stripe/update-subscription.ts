import {stripe} from "~/server/utils/stripe";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User not found',
    })
  }

  const { data: subscriptions} = await stripe.subscriptions.list({
    customer: user.user_metadata.stripe_customer_id,
  })

  if (!subscriptions.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Subscription not found',
    })
  }

  const {error} = await client.from('profiles')
    .update({
      plan: 'premium_monthly'
    })
    .eq('user_id', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile',
    })
  }
})