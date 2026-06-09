// ============================================================================
// Composable: useActivityLog
// ============================================================================
// Provides a clean, ergonomic API for logging real user actions across all
// modules. Import and call `log()` anywhere in pages or components.
//
// The currently logged-in user is automatically set as the actor on every
// log entry — no need to pass it manually at each call site.
//
// Usage:
//   const { log } = useActivityLog()
//   log('Users', 'created', 'Created user John Doe')
//   log('Users', 'deleted', 'Deleted user Jane Smith', { meta: { id: user.id } })
//
// NOTE: Do NOT call this from seeder or mock-data operations.

import type { ActivityLogAction } from '~/types/activityLog'
import { useActivityLogStore } from '~/stores/activityLogStore'

export const useActivityLog = () => {
    const store = useActivityLogStore()
    const { currentUser } = useDemoAuth()

    /**
     * Log a real user-initiated action.
     * The actor is automatically resolved from the current session.
     *
     * @param module      - The module/page where the action occurred (e.g. 'Users')
     * @param action      - The action type: 'created' | 'updated' | 'deleted' | 'viewed'
     * @param description - Human-readable description (e.g. 'Created user John Doe')
     * @param options     - Optional: override actor or attach meta context
     */
    const log = (
        module: string,
        action: ActivityLogAction,
        description: string,
        options?: { actor?: string; meta?: Record<string, unknown> }
    ) => {
        store.addLog(module, action, description, {
            ...options,
            // Prefer explicit actor override, otherwise use the logged-in user
            actor: options?.actor ?? currentUser.value?.name,
        })
    }

    return { log }
}
