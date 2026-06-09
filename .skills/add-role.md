# Skill: Add a New Role

## Purpose
Add a new system role to the auth system by updating all five files that must stay in sync: the type union, the auth store's demo profiles, the login page options, the route middleware access rules, and optionally the sidebar nav visibility filter.

## When to Use
- Introducing a new user role (e.g., `Manager`, `Supervisor`, `Viewer`)
- Expanding the access control model with a new permission tier
- Adding a role-specific landing page or restricted page

## Prerequisites
- `app/types/auth.ts` exists with the `SystemRole` union and `AuthUser` interface
- `app/stores/authStore.ts` exists with a `DEMO_USERS` record
- `app/middleware/auth.global.ts` exists with the global route guard
- `app/pages/login.vue` exists with the `roleOptions` array and `handleLogin`
- `app/layouts/default.vue` uses `allNavItems` with optional `meta: { adminOnly: true }` filtering

## Steps

### Step 1 — Extend the `SystemRole` union type

Open `app/types/auth.ts` and add the new role to the union:

```ts
// Before
export type SystemRole = 'Admin' | 'Staff'

// After
export type SystemRole = 'Admin' | 'Staff' | 'Manager'
```

The `AuthUser` interface does not need to change — it uses `SystemRole` directly.

---

### Step 2 — Add a demo user profile to the auth store

Open `app/stores/authStore.ts` and add an entry to the `DEMO_USERS` record. TypeScript will error if you add to the union without adding the matching profile — this is intentional.

```ts
const DEMO_USERS: Record<SystemRole, AuthUser> = {
    Admin: {
        name: 'Alex Rivera',
        role: 'Admin',
    },
    Staff: {
        name: 'Sam Torres',
        role: 'Staff',
    },
    // Add the new role:
    Manager: {
        name: 'Jordan Lee',
        role: 'Manager',
    },
}
```

> Choose a realistic demo name. The name appears in the `UserMenu` sidebar avatar and label.

---

### Step 3 — Add the role option to the login page

Open `app/pages/login.vue` and add an entry to `roleOptions`:

```ts
const roleOptions: { label: string; value: SystemRole; description: string; icon: string }[] = [
    {
        label: 'Admin',
        value: 'Admin',
        description: 'Full access to all pages and features',
        icon: 'i-lucide-shield-check'
    },
    {
        label: 'Staff',
        value: 'Staff',
        description: 'Access to CRUD and Activity Logs',
        icon: 'i-lucide-user-round'
    },
    // Add the new role:
    {
        label: 'Manager',
        value: 'Manager',
        description: '<Describe what this role can access>',
        icon: 'i-lucide-<appropriate-icon>'
    },
]
```

Then update `handleLogin` to define where this role lands after sign-in:

```ts
const handleLogin = () => {
    if (!selectedRole.value) return
    setRole(selectedRole.value)

    if (selectedRole.value === 'Admin') {
        router.push('/')
    } else if (selectedRole.value === 'Manager') {
        router.push('/<manager-home-page>')    // ← add this branch
    } else {
        router.push('/crud')                   // Staff fallback
    }
}
```

---

### Step 4 — Define access rules in the route middleware

Open `app/middleware/auth.global.ts` and add the new role's restrictions. The middleware runs on every client-side navigation.

```ts
export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return

    const authStore = useAuthStore()
    const isLoginPage = to.path === '/login'

    // Unauthenticated: allow only /login
    if (!authStore.isAuthenticated) {
        if (!isLoginPage) return navigateTo('/login')
        return
    }

    // Authenticated user on /login → redirect to their home
    if (isLoginPage) {
        if (authStore.role === 'Admin') return navigateTo('/')
        if (authStore.role === 'Manager') return navigateTo('/<manager-home-page>')
        return navigateTo('/crud')    // Staff default
    }

    // Staff cannot access Dashboard
    if (authStore.role === 'Staff' && to.path === '/') {
        return navigateTo('/crud')
    }

    // Add restrictions for the new role:
    if (authStore.role === 'Manager' && to.path === '/') {
        return navigateTo('/<manager-home-page>')
    }
})
```

> **Rule of thumb**: Only add guards for pages the role should NOT be able to access. If the role can see everything Staff can, you may not need any new guard at all.

---

### Step 5 (Optional) — Update sidebar nav visibility

Open `app/layouts/default.vue`. If any existing nav items should be **hidden from the new role**, add a filter condition. The current pattern uses `meta: { adminOnly: true }` to hide items from non-Admins.

**If your new role needs a different visibility tier**, extend the filter:

```ts
const allNavItems: NavigationMenuItem[] = [
    { type: 'label', label: 'Menu' },
    { label: 'Dashboard', icon: 'i-lucide-chart-pie', to: '/', meta: { adminOnly: true } },
    { label: 'CRUD', icon: 'i-lucide-folder-open', to: '/crud' },
    { label: 'Activity Logs', icon: 'i-lucide-activity', to: '/activity-logs' },
    // New role-specific page (visible to Managers + Admins, not Staff):
    { label: 'Reports', icon: 'i-lucide-bar-chart-2', to: '/reports', meta: { adminOnly: true } },
]

// Update the computed filter to match the new visibility rules:
const items = computed<NavigationMenuItem[][]>(() => [
    [
        ...allNavItems.filter(item =>
            !(item as any).meta?.adminOnly || isAdmin.value
            // Add more conditions here if needed:
            // || isManager.value
        )
    ]
])
```

> If you need a `isManager` computed, add a getter to `authStore` and expose it via `useDemoAuth()`:
> ```ts
> // authStore.ts getters:
> isManager: (state): boolean => state.currentUser?.role === 'Manager',
>
> // useDemoAuth.ts return:
> isManager: computed(() => store.isManager),
> ```

---

## Conventions
- **Always update all 4 required files** (type → store → login → middleware) in one pass — leaving any out will cause TypeScript errors or broken auth flows
- `DEMO_USERS` must be a complete `Record<SystemRole, AuthUser>` — TypeScript will enforce exhaustiveness
- **Role names are PascalCase strings**: `'Admin'`, `'Staff'`, `'Manager'` — not lowercase
- **Redirect in `handleLogin`** must have an explicit branch for every role — avoid relying on a catch-all fallback for new roles
- **Middleware guards are additive** — only add guards for pages the role should NOT reach
- `meta: { adminOnly: true }` on a nav item hides it from non-Admins in the current filter — if your role needs finer-grained visibility, add a new flag (e.g., `meta: { managerOnly: true }`) and extend the computed filter accordingly
- The `import.meta.server` guard at the top of the middleware is **required** — do not remove it

## Output / Deliverables
- `app/types/auth.ts` — new role added to `SystemRole`
- `app/stores/authStore.ts` — new demo user profile in `DEMO_USERS`
- `app/pages/login.vue` — new role in `roleOptions` + redirect branch in `handleLogin`
- `app/middleware/auth.global.ts` — access rules for the new role
- `app/layouts/default.vue` — (optional) nav visibility update

## Verification
- `pnpm typecheck` passes — missing `DEMO_USERS` entry will produce a TS error if forgotten
- Log in as the new role on `/login` — correct redirect fires
- Navigate directly to a restricted page as the new role — middleware redirects correctly
- Sidebar shows only the expected nav items for the new role
- `UserMenu` shows the correct name and role badge
- Logging out returns to `/login` and clears the session
