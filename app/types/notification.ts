// ============================================================================
// Types: Notification
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: string
    title: string
    body: string
    type: NotificationType
    isRead: boolean
    createdAt: string
    module?: string   // optional: which app module triggered it (e.g. 'CRUD', 'Auth')
}
