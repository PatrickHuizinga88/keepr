import type {Database} from "~/types/database.types";

export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/login')
  }

  const { data: profile, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.value.id)
    .single()

  if (error || !profile) {
    return navigateTo('/')
  }
  if (profile.role !== 'admin') {
    return navigateTo('/')
  }
})
