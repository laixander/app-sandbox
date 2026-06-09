// ============================================================================
// Types: Auth
// ============================================================================

export type SystemRole = 'Admin' | 'Staff'

export interface AuthUser {
    name: string
    role: SystemRole
}
