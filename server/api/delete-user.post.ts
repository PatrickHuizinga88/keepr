import {serverSupabaseServiceRole} from "#supabase/server";

interface Body {
  id: string
}

export default defineEventHandler(async (event) => {
  const { id } = await readBody<Body>(event)

  if (!id) {
    return createError({
      statusCode: 400,
      statusMessage: 'ID is required',
      message: 'ID is required'
    })
  }
  const client = serverSupabaseServiceRole(event)
  const {public: {baseUrl}} = useRuntimeConfig()

  const { error } = await client.auth.admin.deleteUser(id)

  if (error) {
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message
    })
  }

  // const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
  //   redirectTo: `${baseUrl}/registreren`, // TODO: Add locale route
  // })
})