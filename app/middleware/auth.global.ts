// ============================================================================
// Middleware: auth.global
// ============================================================================
// Global route guard that enforces role-based access control.
//
// Rules:
//  - Unauthenticated users → redirect to /login
//  - Authenticated users on /login → redirect to their home page
//  - Staff accessing / (Dashboard) → redirect to /crud

import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware((to) => {
    // Skip on the server — localStorage isn't available during SSR.
    // Pinia persisted state only rehydrates on the client, so running
    // auth checks server-side always sees an empty store and causes a
    // redirect flash to /login on every browser refresh.
    if (import.meta.server) return

    const authStore = useAuthStore()

    const isLoginPage = to.path === '/login'

    // Unauthenticated: allow only /login
    if (!authStore.isAuthenticated) {
        if (!isLoginPage) {
            return navigateTo('/login')
        }
        return
    }

    // Authenticated user visiting /login → redirect to home
    if (isLoginPage) {
        if (authStore.role === 'Admin') {
            return navigateTo('/')
        }
        return navigateTo('/crud')
    }

    // Staff cannot access Dashboard
    if (authStore.role === 'Staff' && to.path === '/') {
        return navigateTo('/crud')
    }
})
