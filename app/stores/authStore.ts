// ============================================================================
// Store: Auth
// ============================================================================
// Manages the demo session — stores the currently logged-in user and role.
// Persisted to localStorage so session survives page reloads.
//
// Usage:
//   const authStore = useAuthStore()
//   authStore.login('Admin')
//   authStore.logout()

import { defineStore } from 'pinia'
import type { AuthUser, SystemRole } from '~/types/auth'

// Pre-built demo user profiles per role
const DEMO_USERS: Record<SystemRole, AuthUser> = {
    Admin: {
        name: 'Alex Rivera',
        role: 'Admin',
    },
    Staff: {
        name: 'Sam Torres',
        role: 'Staff',
    },
}

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        currentUser: null as AuthUser | null,
    }),

    getters: {
        isAuthenticated: (state): boolean => state.currentUser !== null,
        role: (state): SystemRole | null => state.currentUser?.role ?? null,
        isAdmin: (state): boolean => state.currentUser?.role === 'Admin',
        isStaff: (state): boolean => state.currentUser?.role === 'Staff',
    },

    actions: {
        login(role: SystemRole) {
            this.currentUser = DEMO_USERS[role]
        },

        logout() {
            this.currentUser = null
        },
    },

    persist: {
        storage: persistedState.localStorage,
    },
})
