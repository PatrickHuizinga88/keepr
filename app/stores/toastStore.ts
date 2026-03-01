import {defineStore} from "pinia";
import {v4 as uuid} from 'uuid';
import {useT} from "~/composables/useT";

type Toast = {
  id: string,
  type: 'success' | 'destructive',
  title: string
  description?: string
}

type ToastProps =
  | { type: 'success' | 'destructive', isError: true }
  | { type: 'success' | 'destructive', isError?: false, action: 'save' | 'update' | 'delete' | 'retrieve', item: string }

export const useToastStore = defineStore('toastStore', {
  state: () => ({
    toasts: [] as Toast[]
  }),
  actions: {
    createToast(props: ToastProps) {
      const {type, isError} = props
      const id = uuid()

      const getToastText = (text: 'title' | 'description') => {
        const actionContent = {
          error: `common.toasts.error.${text}`,
          save: {
            success: `common.toasts.save.success.${text}`,
            destructive: `common.toasts.save.error.${text}`
          },
          update: {
            success: `common.toasts.update.success.${text}`,
            destructive: `common.toasts.update.error.${text}`
          },
          delete: {
            success: `common.toasts.delete.success.${text}`,
            destructive: `common.toasts.delete.error.${text}`
          },
          retrieve: {
            success: `common.toasts.retrieve.success.${text}`,
            destructive: `common.toasts.retrieve.error.${text}`
          },
        }

        if (isError) {
          return useT(actionContent.error);
        }

        const { action, item } = props;
        return useT(actionContent[action][type], {item: lowercase(item)});
      }

      this.toasts.push(
        {
          id,
          type,
          title: capitalizeSentence(getToastText('title')),
          description: capitalizeSentence(getToastText('description'))
        }
      )

      this.updateState(id)
    },

    updateState(id: string) {
      setTimeout(() => {
        this.toasts = this.toasts.filter(toast => toast.id !== id)
      }, 4000)
    }
  }
})