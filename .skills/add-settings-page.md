# Skill: Add a Settings Page

## Purpose
Create a preferences page with form sections for account display, display preferences, appearance, and data management — following the exact structure of `app/pages/settings.vue`. Unlike CRUD pages, this is a **form-without-a-table**: no `isTable: true`, no Add/Edit modal, no seeder.

## When to Use
- Adding a user preferences or application settings page
- A page that reads from and writes to a Pinia store without entity CRUD
- A page with grouped `UCard` sections rather than a table or chart grid

## How This Differs From a CRUD Page

| Aspect | CRUD Page | Settings Page |
|---|---|---|
| Layout | `isTable: true` (flex full-height) | No `isTable` (natural scroll with `p-4`) |
| Content shape | Table + card grid | `UCard` sections stacked vertically |
| Data source | Entity store (users, etc.) | Settings store + auth store |
| Actions | Add / Edit / Delete records | Update preferences, trigger confirmations |
| Modal | `Add<Entity>Modal` with Zod | `ConfirmationModal` only (for destructive actions) |
| Teleport | "Add" button in header | Nothing — no primary action button |

## Prerequisites
- `app/types/settings.ts` exists with `AppSettings` interface
- `app/stores/settingsStore.ts` exists with persisted preference actions
- `app/layouts/default.vue` with Settings nav item registered

## Steps

1. **Create** `app/pages/settings.vue`

2. **Set up `definePageMeta`** — no `isTable`:
   ```ts
   definePageMeta({
       title: 'Settings',
   })
   ```

3. **Import required composables and stores**:
   ```ts
   const { currentUser, isAdmin, logout } = useDemoAuth()
   const settings = useSettingsStore()
   const activityLogStore = useActivityLogStore()
   const toast = useAppToast()
   const colorMode = useColorMode()
   const appConfig = useAppConfig()
   ```

4. **Structure the page as `UCard` sections** with a `max-w-2xl mx-auto` container:
   ```html
   <div class="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
       <UCard variant="subtle" class="shadow-sm">
           <template #header> ... </template>
           <!-- section content -->
       </UCard>
       <!-- repeat for each section -->
   </div>
   ```

5. **Standard sections** — include as many as apply:

   | Section | What it covers |
   |---|---|
   | **Account** | Current user avatar + name + role badge + sign out button |
   | **Display Preferences** | `defaultViewMode` toggle, `compactMode` switch |
   | **Appearance** | Dark mode toggle + primary color palette picker |
   | **Data Management** | Clear logs button, reset preferences button |

6. **Appearance — dark mode** (use a computed with getter/setter):
   ```ts
   const isDark = computed({
       get: () => colorMode.value === 'dark',
       set: (val) => { colorMode.preference = val ? 'dark' : 'light' },
   })
   ```

7. **Appearance — color picker** (access `appConfig` directly, same pattern as `UserMenu`):
   ```ts
   const primaryColors = ['teal', 'blue', 'violet', 'rose', 'orange', 'emerald', 'sky', 'pink', 'indigo']
   // In template:
   // :style="`background-color: var(--color-${color}-500)`"
   // @click="appConfig.ui.colors.primary = color"
   ```

8. **Destructive actions** always use `ConfirmationModal`:
   ```ts
   const isClearLogsConfirmOpen = ref(false)
   const confirmClearLogs = () => {
       activityLogStore.clearLogs()
       toast.error('Logs Cleared', 'All activity logs have been removed.')
   }
   ```

9. **Register the page in the sidebar** — open `app/layouts/default.vue` and add to `allNavItems`:
   ```ts
   { type: 'separator' },
   { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
   ```

10. **Add a Settings shortcut in `UserMenu`** — prepend to the `items` computed:
    ```ts
    [{ label: 'Settings', icon: 'i-lucide-settings', onSelect: () => router.push('/settings') }],
    ```

## `settingsStore` Pattern

The settings store follows the standard options API pattern but without `isLoading`, `deployMockData`, or entity CRUD:

```ts
export const useSettingsStore = defineStore('settingsStore', {
    state: () => ({
        defaultViewMode: 'list' as 'list' | 'card',
        compactMode: false,
        // Add new preferences here — each needs a matching action
    }),

    actions: {
        setDefaultViewMode(mode: 'list' | 'card') { this.defaultViewMode = mode },
        setCompactMode(enabled: boolean) { this.compactMode = enabled },
        resetToDefaults() {
            this.defaultViewMode = 'list'
            this.compactMode = false
        },
    },

    persist: { storage: persistedState.localStorage },
})
```

## Wiring Preferences Into Other Pages

Once a preference exists in the store, wire it into the pages it affects:

```ts
// In app/pages/crud.vue — use settingsStore.defaultViewMode as the initial value:
const settings = useSettingsStore()
const viewMode = ref<'list' | 'card'>(settings.defaultViewMode)
```

> The `ref` captures the value at mount time — the CRUD page does not reactively follow store changes while the page is open. This is intentional: changing view mode in Settings takes effect on the next page visit, not mid-session.

## Conventions
- **No `isTable: true`** — Settings uses the natural scroll layout (`p-4 overflow-y-auto scrollbar`)
- **`max-w-2xl mx-auto`** — always constrain the settings content width for readability
- **`UCard` sections** — one card per logical group; use `#header` slot for section title + icon
- **`USeparator`** inside a card to separate items within the same section
- **No Teleport** — Settings pages don't need header action buttons
- **`ConfirmationModal` for destructive actions** — never use inline `window.confirm()`
- **No entity seeder** — `settingsStore` has no `deployMockData`; preferences reset via `resetToDefaults()`
- **Add new preference → add matching action → wire into affected page**
- **Always add Settings to both sidebar nav AND UserMenu** for dual access

## Output / Deliverables
- `app/types/settings.ts` — `AppSettings` interface
- `app/stores/settingsStore.ts` — persisted preferences store
- `app/pages/settings.vue` — preferences page
- `app/layouts/default.vue` — Settings nav item added
- `app/components/UserMenu.vue` — Settings shortcut added

## Verification
- `pnpm typecheck` passes with no errors
- Navigate to `/settings` — all sections render
- Toggle dark mode — theme switches immediately
- Change default view mode → navigate to `/crud` — view opens in the selected mode
- Clear logs (with activity logs present) — toast fires, log count drops to 0, button disables
- Reset preferences → toast fires, view mode reverts to List
- UserMenu → Settings link navigates correctly
- Sidebar Settings item is active when on `/settings`
