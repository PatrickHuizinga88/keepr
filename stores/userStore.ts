import { defineStore } from 'pinia';
import { useSupabaseClient, useSupabaseUser } from '#imports';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    role: null as string | null,
    user: null as any,
  }),

  actions: {
    async fetchUserRole() {
      const supabase = useSupabaseClient();
      const user = useSupabaseUser();

      this.user = user.value;

      if (!this.user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', this.user.id)
        .single();

      if (error) {
        console.error('Rol ophalen mislukt:', error);
        return
      }
      this.role = data.role;
    },

    hasRole(allowed: string | string[]) {
      if (!this.role) return false;
      if (Array.isArray(allowed)) return allowed.includes(this.role);
      return this.role === allowed;
    },
  },
});
