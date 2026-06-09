// ============================================================================
// Store: Notifications
// ============================================================================
// Manages in-app notifications persisted to localStorage.
// New notifications always unshift() — most recent first.
//
// Usage:
//   const store = useNotificationStore()
//   store.addNotification('Title', 'Body', 'success', 'CRUD')
//   store.markAsRead(id)
//   store.markAllAsRead()
//   store.deleteNotification(id)
//   store.unreadCount    // reactive getter used by sidebar badge

import { defineStore } from 'pinia'
import type { Notification, NotificationType } from '~/types/notification'

export const useNotificationStore = defineStore('notificationStore', {
    state: () => ({
        notifications: [] as Notification[],
    }),

    getters: {
        unreadCount: (state): number =>
            state.notifications.filter(n => !n.isRead).length,
        hasUnread: (state): boolean =>
            state.notifications.some(n => !n.isRead),
        hasNotifications: (state): boolean =>
            state.notifications.length > 0,
        totalCount: (state): number =>
            state.notifications.length,
    },

    actions: {
        addNotification(
            title: string,
            body: string,
            type: NotificationType = 'info',
            module?: string,
        ) {
            this.notifications.unshift({
                id: crypto.randomUUID(),
                title,
                body,
                type,
                isRead: false,
                createdAt: new Date().toISOString(),
                module,
            })
        },

        markAsRead(id: string) {
            const n = this.notifications.find(n => n.id === id)
            if (n) n.isRead = true
        },

        markAllAsRead() {
            this.notifications.forEach(n => (n.isRead = true))
        },

        deleteNotification(id: string) {
            this.notifications = this.notifications.filter(n => n.id !== id)
        },

        clearAll() {
            this.notifications = []
        },

        deployMockData() {
            if (this.notifications.length > 0) return
            const now = Date.now()
            const mock: Omit<Notification, 'id'>[] = [
                {
                    title: 'Welcome to Sandbox',
                    body: 'Your demo environment is ready. Explore the features.',
                    type: 'info',
                    isRead: false,
                    createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
                    module: 'System',
                },
                {
                    title: 'User Record Created',
                    body: 'A new user was successfully added to the system.',
                    type: 'success',
                    isRead: false,
                    createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
                    module: 'CRUD',
                },
                {
                    title: 'Storage Limit Approaching',
                    body: 'Your sandbox data is reaching the demo limit.',
                    type: 'warning',
                    isRead: false,
                    createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
                    module: 'System',
                },
                {
                    title: 'Activity Log Cleared',
                    body: 'All activity logs were cleared by an Admin.',
                    type: 'info',
                    isRead: true,
                    createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
                    module: 'Activity Logs',
                },
                {
                    title: 'Export Complete',
                    body: 'User data export has been generated successfully.',
                    type: 'success',
                    isRead: true,
                    createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
                    module: 'CRUD',
                },
                {
                    title: 'Failed Login Attempt',
                    body: 'An unauthorized login attempt was detected and blocked.',
                    type: 'error',
                    isRead: true,
                    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
                    module: 'Auth',
                },
            ]
            mock.forEach(n =>
                this.notifications.push({ id: crypto.randomUUID(), ...n }),
            )
        },

        removeMockData() {
            this.notifications = []
        },
    },

    persist: {
        storage: persistedState.localStorage,
    },
})
