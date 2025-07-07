import {serverSupabaseServiceRole} from "#supabase/server";

interface Body {
  email: string
}

export default defineEventHandler(async (event) => {
  const { email } = await readBody<Body>(event)

  if (!email) {
    return createError({
      statusCode: 400,
      statusMessage: 'Email is required',
      message: 'Email is required'
    })
  }
  const client = serverSupabaseServiceRole(event)
  const {public: {baseUrl}} = useRuntimeConfig()

  const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${baseUrl}/sign-up`,
  })
  if (error) {
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message
    })
  }

  return data.user
})