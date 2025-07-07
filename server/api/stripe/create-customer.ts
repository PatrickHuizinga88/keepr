import {stripe} from "~/server/utils/stripe";

export default defineEventHandler(async (event) => {
  const { email } = getQuery(event)

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    })
  }

  const {data: customers} = await stripe.customers.search({
    query: `email:"${email}"`,
    limit: 1,
  });

  if (customers.length) {
    return customers[0];
  }

  return await stripe.customers.create({
    email: email as string,
  })
})