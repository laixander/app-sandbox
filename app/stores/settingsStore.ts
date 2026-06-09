// ============================================================================
// Store: Settings
// ============================================================================
// Manages persisted user preferences that affect the UI across sessions.
// Persisted to localStorage so preferences survive page reloads.
//
// Usage:
//   const settingsStore = useSettingsStore()
//   settingsStore.defaultViewMode   // 'list' | 'card'
//   settingsStore.setDefaultViewMode('card')

import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settingsStore', {
    state: () => ({
        defaultViewMode: 'list' as 'list' | 'card',
        sidebarCollapsed: false,
    }),

    actions: {
        setDefaultViewMode(mode: 'list' | 'card') {
            this.defaultViewMode = mode
        },

        setSidebarCollapsed(collapsed: boolean) {
            this.sidebarCollapsed = collapsed
        },

        resetToDefaults() {
            this.defaultViewMode = 'list'
            this.sidebarCollapsed = false
        },
    },

    persist: {
        storage: persistedState.localStorage,
    },
})
