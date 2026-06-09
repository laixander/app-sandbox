# Skill: Add an Activity Log View

## Purpose
Create a read-only audit table page that displays timestamped log entries for a given module or the whole app, with multi-filter controls (module dropdown, action dropdown, text search), live relative timestamp refresh, and a guarded "Clear Logs" action — following the exact structure of `app/pages/activity-logs.vue`.

## When to Use
- Adding a dedicated audit trail / history page for any module (e.g., "Reservation History", "Change Log")
- The page displays **read-only** log entries — no Add / Edit modal, no entity seeder
- Log entries are produced by `useActivityLog()` calls in other pages, NOT manually created here

## How This Differs From a CRUD Page

| Aspect | CRUD Page | Activity Log View |
|---|---|---|
| Create / Edit modal | ✅ Yes | ❌ None |
| Seeder integration | ✅ Yes | ❌ None — logs are real user actions |
| Store actions | `create`, `update`, `delete` | `addLog`, `clearLogs` only |
| Filtering | Global text search | Module dropdown + Action dropdown + text search |
| Card view toggle | ✅ Yes | ❌ Table only |
| Timestamp rendering | Static | Relative time with `UTooltip` + live `setInterval` |
| Action badge | `UDropdownMenu` | `Record<ActionType, { color, icon }>` config map |
| Header Teleport | "Add" button | Log count badge + "Clear Logs" button (conditional) |

## Prerequisites
- `app/types/activityLog.ts` exists with `ActivityLog` and `ActivityLogAction` types
- `app/stores/activityLogStore.ts` exists with `addLog`, `clearLogs`, `logs`, `hasLogs`, `totalLogs`, `modules` getter
- `useActivityLog()` composable is being called in other pages (it feeds the store)
- `app/layouts/default.vue` is in place

## Steps

1. **Create** `app/pages/<name>.vue`

2. **Set up `definePageMeta`**:
   ```ts
   definePageMeta({
       title: '<Page Title>',
       isTable: true,
   })
   ```

3. **Import dependencies**:
   ```ts
   import { ref, computed, h } from 'vue'
   import { UBadge, UTooltip } from '#components'
   import type { TableColumn } from '@nuxt/ui'
   import type { ActivityLog, ActivityLogAction } from '~/types/activityLog'
   import { useActivityLogStore } from '~/stores/activityLogStore'
   ```

4. **Set up store, toast, and activity log** (log the clear action):
   ```ts
   const store = useActivityLogStore()
   const toast = useAppToast()
   const { log } = useActivityLog()
   ```

5. **Define filter refs**:
   ```ts
   const globalFilter = ref('')
   const selectedModule = ref('All')
   const selectedAction = ref<ActivityLogAction | 'All'>('All')

   // Dynamically built from the store's unique module list
   const moduleOptions = computed(() => ['All', ...store.modules])

   const actionOptions: { label: string; value: ActivityLogAction | 'All' }[] = [
       { label: 'All Actions', value: 'All' },
       { label: 'Created',     value: 'created' },
       { label: 'Updated',     value: 'updated' },
       { label: 'Deleted',     value: 'deleted' },
       { label: 'Viewed',      value: 'viewed' },
   ]
   ```

6. **Define the filtered logs computed**:
   ```ts
   const filteredLogs = computed(() => {
       let result = store.logs

       if (selectedModule.value !== 'All') {
           result = result.filter(l => l.module === selectedModule.value)
       }
       if (selectedAction.value !== 'All') {
           result = result.filter(l => l.action === selectedAction.value)
       }
       if (globalFilter.value.trim()) {
           const q = globalFilter.value.toLowerCase()
           result = result.filter(l =>
               l.module.toLowerCase().includes(q) ||
               l.action.toLowerCase().includes(q) ||
               l.description.toLowerCase().includes(q) ||
               (l.actor ?? '').toLowerCase().includes(q)
           )
       }

       return result
   })
   ```

7. **Define the action badge config map**:
   ```ts
   const actionConfig: Record<ActivityLogAction, { color: 'success' | 'warning' | 'error' | 'info'; icon: string }> = {
       created: { color: 'success', icon: 'i-lucide-plus-circle' },
       updated: { color: 'warning', icon: 'i-lucide-pencil' },
       deleted: { color: 'error',   icon: 'i-lucide-trash-2' },
       viewed:  { color: 'info',    icon: 'i-lucide-eye' },
   }
   ```

8. **Define timestamp helpers**:
   ```ts
   const formatRelativeTime = (isoString: string): string => {
       const diff = Date.now() - new Date(isoString).getTime()
       const seconds = Math.floor(diff / 1000)
       if (seconds < 60)  return `${seconds}s ago`
       const minutes = Math.floor(seconds / 60)
       if (minutes < 60)  return `${minutes}m ago`
       const hours = Math.floor(minutes / 60)
       if (hours < 24)    return `${hours}h ago`
       return `${Math.floor(hours / 24)}d ago`
   }

   const formatFullTimestamp = (isoString: string): string =>
       new Date(isoString).toLocaleString(undefined, {
           year: 'numeric', month: 'short', day: '2-digit',
           hour: '2-digit', minute: '2-digit', second: '2-digit',
       })
   ```

9. **Define table columns** using `h()` render functions:
   ```ts
   const tableColumns: TableColumn<ActivityLog>[] = [
       {
           accessorKey: 'timestamp',
           header: 'When',
           cell: ({ row }) =>
               h(UTooltip, {
                   text: formatFullTimestamp(row.original.timestamp),
                   delayDuration: 200,
               }, {
                   // Wrap in a div keyed to `tick` so relative time refreshes
                   default: () => h('span', {
                       class: 'text-sm text-muted font-mono cursor-default tabular-nums',
                   }, formatRelativeTime(row.original.timestamp))
               })
       },
       {
           accessorKey: 'module',
           header: 'Module',
           cell: ({ row }) =>
               h(UBadge, {
                   label: row.original.module,
                   variant: 'soft',
                   color: 'neutral',
                   class: 'font-medium',
               })
       },
       {
           accessorKey: 'action',
           header: 'Action',
           cell: ({ row }) => {
               const cfg = actionConfig[row.original.action]
               return h(UBadge, {
                   label: row.original.action.charAt(0).toUpperCase() + row.original.action.slice(1),
                   color: cfg.color,
                   variant: 'subtle',
                   icon: cfg.icon,
                   class: 'capitalize gap-1.5',
               })
           }
       },
       {
           accessorKey: 'description',
           header: 'Description',
           cell: ({ row }) =>
               h('p', { class: 'text-sm text-default max-w-md truncate' }, row.original.description)
       },
       {
           accessorKey: 'actor',
           header: 'Actor',
           cell: ({ row }) =>
               h('span', { class: 'text-sm text-muted' }, row.original.actor ?? '—')
       },
   ]
   ```

10. **Define the live tick + the clear confirmation**:
    ```ts
    // Re-render relative timestamps every 30 seconds
    const tick = ref(0)
    let timer: ReturnType<typeof setInterval>
    onMounted(() => { timer = setInterval(() => tick.value++, 30_000) })
    onUnmounted(() => clearInterval(timer))

    // Clear logs flow
    const isClearConfirmOpen = ref(false)

    const confirmClear = () => {
        store.clearLogs()
        log('Activity Logs', 'deleted', 'Cleared all activity logs')
        toast.error('Logs Cleared', 'All activity logs have been permanently removed.')
    }
    ```

11. **Build the template**:
    ```html
    <PageHeading forTable title="Activity Logs" description="Real-time audit trail of all user actions">
        <div class="flex items-center gap-2">
            <!-- Module filter -->
            <USelect v-model="selectedModule" :items="moduleOptions" class="w-36" icon="i-lucide-layers" />
            <!-- Action filter -->
            <USelect v-model="selectedAction" :items="actionOptions" value-key="value" label-key="label"
                class="w-36" icon="i-lucide-filter" />
            <!-- Text search -->
            <TableGlobalFilter v-model="globalFilter" />
        </div>
    </PageHeading>

    <ClientOnly>
        <!-- Inject count badge + clear button into the layout header -->
        <Teleport to="#header-actions-teleport">
            <UBadge v-if="store.hasLogs" :label="`${store.totalLogs} / 500`"
                variant="soft" color="neutral" icon="i-lucide-database" class="font-mono text-xs" />
            <UButton v-if="store.hasLogs" color="error" variant="soft"
                icon="i-lucide-trash-2" label="Clear Logs" @click="isClearConfirmOpen = true" />
        </Teleport>

        <!-- Re-render on tick to refresh relative timestamps -->
        <div :key="tick" class="contents">
            <UTable :data="filteredLogs" :columns="tableColumns" sticky class="flex-1 scrollbar">
                <template #empty>
                    <UEmpty variant="naked" icon="i-lucide-activity" title="No activity logs"
                        :description="store.hasLogs
                            ? 'No logs match your current filters. Try adjusting or clearing them.'
                            : 'Actions you take across the app will appear here in real time.'" />
                </template>
            </UTable>
        </div>
    </ClientOnly>

    <!-- Clear Confirmation Modal -->
    <ConfirmationModal v-model:open="isClearConfirmOpen" title="Clear all logs?"
        description="This will permanently delete all activity logs. This action cannot be undone."
        confirm-label="Yes, Clear All" confirm-color="error" @confirm="confirmClear" />
    ```

12. **Register the page in the sidebar** — open `app/layouts/default.vue` and add to `items`:
    ```ts
    { label: 'Activity Logs', icon: 'i-lucide-activity', to: '/<name>' }
    ```

## Conventions
- **Read-only** — no Add / Edit modal, no `openCreateModal`, no `openEditModal`
- **No seeder** — never call `SeederService` or `store.deployMockData()` on this page
- **`filteredLogs` computed** applies module, action, and text filters in sequence
- **`moduleOptions`** must be derived from `store.modules` (computed) so it updates as new modules log
- **`actionOptions`** is a static typed array — always include all four action types
- **Action badge config** uses a `Record<ActivityLogAction, { color, icon }>` — never use inline conditional logic per action
- **Timestamp column**: always wrap in `UTooltip` with the full formatted date as tooltip text; display relative time as the cell content
- **Live tick**: use `onMounted`/`onUnmounted` with `setInterval(30_000)` — wrap the `UTable` in `<div :key="tick" class="contents">` to trigger re-renders
- **Teleport content**: count badge (`${store.totalLogs} / 500`) and Clear button must both be `v-if="store.hasLogs"` — show nothing when no logs exist
- **The clear action logs itself**: always call `log('Activity Logs', 'deleted', 'Cleared all activity logs')` inside `confirmClear`
- **`UEmpty` description is contextual**: use different text when logs exist but filters return nothing vs. when no logs exist at all. Always use `variant="naked"`.
- **No `columnVisibility` or `TableColumnToggle`** — all columns are always visible
- **No card/list view toggle** — table only

## Output / Deliverables
- `app/pages/<name>.vue` — read-only audit log viewer
- `app/layouts/default.vue` — sidebar nav item added

## Verification
- `pnpm typecheck` passes with no errors
- Navigate to `/<name>` — page renders empty with the contextual empty state
- Perform a CRUD action on another page — a log entry appears immediately
- Module and Action dropdowns filter correctly; text search works
- `UTooltip` on the timestamp cell shows the full formatted date
- Relative timestamps update after 30 seconds without a page reload
- "Clear Logs" button appears only when logs exist and triggers the confirmation modal
- After clearing, the page shows the empty state and the header Teleport content disappears
