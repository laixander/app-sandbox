// ============================================================================
// Store: activityLogStore
// ============================================================================
// Central store for all real user-initiated activity logs across every module.
// Seeder/mock-data operations are intentionally excluded from logging.
//
// Max capacity: 500 entries (FIFO — oldest are trimmed when limit is reached).
// Persisted to localStorage via nuxt-pinia-plugin-persistedstate.

import { defineStore } from 'pinia'
import type { ActivityLog, ActivityLogAction } from '~/types/activityLog'

const MAX_LOG_ENTRIES = 500

export const useActivityLogStore = defineStore('activityLogStore', {
    state: () => ({
        logs: [] as ActivityLog[],
    }),

    actions: {
        /**
         * Add a new log entry. Automatically generates id and timestamp.
         * Trims the oldest entry when the MAX_LOG_ENTRIES cap is reached.
         */
        addLog(
            module: string,
            action: ActivityLogAction,
            description: string,
            options?: { actor?: string; meta?: Record<string, unknown> }
        ) {
            const entry: ActivityLog = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                module,
                action,
                description,
                actor: options?.actor,
                meta: options?.meta,
            }

            // Prepend so newest entries appear first
            this.logs.unshift(entry)

            // Enforce cap — drop oldest (tail) entries
            if (this.logs.length > MAX_LOG_ENTRIES) {
                this.logs = this.logs.slice(0, MAX_LOG_ENTRIES)
            }
        },

        /**
         * Remove all log entries permanently.
         */
        clearLogs() {
            this.logs = []
        },
    },

    getters: {
        /** Total number of stored log entries */
        totalLogs: (state) => state.logs.length,

        /** Whether there are any logs */
        hasLogs: (state) => state.logs.length > 0,

        /** Unique list of modules that have logs */
        modules: (state): string[] => [...new Set(state.logs.map((l) => l.module))],

        /** Most recent N logs (default 50) */
        recentLogs: (state) => (limit = 50) => state.logs.slice(0, limit),

        /** Filter logs by a specific module */
        logsByModule: (state) => (module: string) =>
            state.logs.filter((l) => l.module === module),
    },

    persist: {
        storage: persistedState.localStorage,
    },
})
