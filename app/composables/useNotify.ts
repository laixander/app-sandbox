// ============================================================================
// Composable: useNotify
// ============================================================================
// Thin ergonomic wrapper over useNotificationStore.
// Auto-imported — no manual import needed.
//
// Usage:
//   const { notify } = useNotify()
//   notify('Title', 'Body')                          // defaults to 'info'
//   notify('Saved', 'Record updated.', 'success', 'CRUD')
//   notify('Error', 'Something failed.', 'error')

import type { NotificationType } from '~/types/notification'

export const useNotify = () => {
    const store = useNotificationStore()

    const notify = (
        title: string,
        body: string,
        type: NotificationType = 'info',
        module?: string,
    ) => {
        store.addNotification(title, body, type, module)
    }

    return { notify }
}
