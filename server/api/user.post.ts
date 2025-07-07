import {serverSupabaseServiceRole} from "#supabase/server";

interface Body {
  id: string
}

export default defineEventHandler(async (event) => {
  const {id} = await readBody<Body>(event)
  if (!id) {
    return createError({
      statusCode: 400,
      statusMessage: 'ID is required',
      message: 'ID is required'
    })
  }

  const client = serverSupabaseServiceRole(event)

  const {data, error} = await client.auth.admin.getUserById(id)

  if (error) {
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message
    })
  }

  return data.user
})