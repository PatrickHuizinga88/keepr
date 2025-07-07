export function useT (key: string, options?: any): string {
  return useNuxtApp().$i18n.t(key, options)
}