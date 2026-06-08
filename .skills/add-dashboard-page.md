# Skill: Add a Dashboard Page

## Purpose
Create a non-table overview/summary page using `StatCard` components, computed store aggregates, and an optional recent-activity section — following the layout conventions for non-table pages.

## When to Use
- Adding a home screen, overview, or summary page for an entity or section
- The page primarily shows KPI numbers, charts, or summary grids — NOT a paginated data table
- The page uses `StatCard` components and does NOT need `isTable: true`

## Prerequisites
- At least one Pinia store exists with data to summarize
- `app/components/StatCard.vue` is available
- `app/layouts/default.vue` is in place

## How This Differs From a CRUD Page

| Aspect | CRUD Page (`add-crud-page.md`) | Dashboard Page (this skill) |
|---|---|---|
| `isTable` in `definePageMeta` | `true` | `false` (or omit) |
| Content wrapper | `flex flex-col overflow-hidden min-h-0` | `p-4 sm:p-6 overflow-y-auto scrollbar` |
| Primary component | `UTable` / card grid | `StatCard` grid + optional lists |
| `PageHeading` | With `forTable` prop | Without `forTable` prop |
| Scrolling | Table/card grid scrolls internally | Entire page content scrolls |
| Empty state | `<Empty>` component | Usually not needed (shows 0 values) |

## Steps

1. **Create** `app/pages/<name>.vue`

2. **Set up `definePageMeta`** — omit `isTable` or set it to `false`:
   ```ts
   definePageMeta({
       title: '<Page Title>',
       // No isTable — this is a scrollable content page
   })
   ```

3. **Import dependencies and set up the store**:
   ```ts
   import { computed } from 'vue'
   import { use<Entity>Store } from '~/stores/<entity>Store'

   const store = use<Entity>Store()
   ```

4. **Define computed KPIs** from the store:
   ```ts
   const totalCount = computed(() => store.<entities>.length)
   const activeCount = computed(() => store.<entities>.filter(e => e.status === 'Active').length)
   const inactiveCount = computed(() => store.<entities>.filter(e => e.status === 'Inactive').length)
   const recentItems = computed(() => store.<entities>.slice(0, 5))
   ```

5. **Build the template** — follow this structure:

   ```html
   <template>
       <!-- Optional: page-level description (non-table pages don't use PageHeading) -->
       <div class="mb-6">
           <h2 class="text-2xl font-bold">Overview</h2>
           <p class="text-sm text-muted mt-1">Summary of all <entities> in the system.</p>
       </div>

       <!-- KPI Grid -->
       <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <StatCard
               title="Total <Entities>"
               :value="totalCount"
               icon="i-lucide-<icon>"
           />
           <StatCard
               title="Active"
               :value="activeCount"
               icon="i-lucide-circle-check"
               trend="+2 this week"
               trendDirection="up"
           />
           <StatCard
               title="Inactive"
               :value="inactiveCount"
               icon="i-lucide-circle-x"
               trend="No change"
               trendDirection="flat"
           />
           <!-- Add more StatCards as needed -->
       </div>

       <!-- Optional: Recent activity / quick list -->
       <UCard variant="subtle" class="shadow-sm">
           <template #header>
               <div class="font-semibold">Recent <Entities></div>
           </template>
           <div v-if="recentItems.length > 0" class="divide-y divide-default">
               <div v-for="item in recentItems" :key="item.id"
                   class="flex items-center justify-between py-3">
                   <div>
                       <p class="text-sm font-medium">{{ item.<nameField> }}</p>
                       <p class="text-xs text-muted">{{ item.<subField> }}</p>
                   </div>
                   <UBadge :label="item.id.slice(0, 8)" variant="soft" color="neutral"
                       class="font-mono text-[11px]" />
               </div>
           </div>
           <div v-else class="py-8 text-center text-sm text-muted">
               No records yet.
           </div>
       </UCard>
   </template>
   ```

6. **Register the page in the sidebar** — open `app/layouts/default.vue` and add to the `items` array:
   ```ts
   { label: '<Page Name>', icon: 'i-lucide-<icon>', to: '/<name>' }
   ```

## StatCard Props Reference

```ts
interface StatCardProps {
    title: string               // Label shown above the value
    value: string | number      // The primary KPI number or text
    icon?: string               // Lucide icon shown top-right (e.g., 'i-lucide-users')
    trend?: string              // Trend label (e.g., '+3 this week')
    trendDirection?: 'up' | 'down' | 'flat'  // Controls arrow icon and color
}
```

- `trendDirection: 'up'` → green arrow up (`i-lucide-arrow-up-right`)
- `trendDirection: 'down'` → red arrow down (`i-lucide-arrow-down-right`)
- `trendDirection: 'flat'` → neutral minus (`i-lucide-minus`)

## Conventions
- Dashboard pages do **NOT** use `isTable: true` in `definePageMeta`
- Dashboard pages do **NOT** use `PageHeading` with the `forTable` prop — use a plain heading `<div>` or omit entirely
- The layout's content wrapper will automatically add `p-4 sm:p-6 overflow-y-auto scrollbar` for non-table pages
- KPI grid: use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` as the standard responsive breakpoint
- All computed values must come from store getters or computed properties — no raw template expressions for aggregations
- Use `UCard variant="subtle"` for section containers
- Do NOT wrap in `<ClientOnly>` unless the component uses browser-only APIs — `StatCard` is SSR-safe
- Sidebar nav items use `i-ph-*` for top-level entries and `i-lucide-*` for sub-items (match existing pattern in `default.vue`)

## Output / Deliverables
- `app/pages/<name>.vue` — new dashboard/overview page
- `app/layouts/default.vue` — sidebar nav item added

## Verification
- `pnpm typecheck` passes with no errors
- Navigate to `/<name>` in the browser
- Page scrolls correctly (does not clip like a table page)
- `StatCard` values update reactively when store data changes (seed via `DemoFab` and verify counts update)
- Sidebar link navigates to the page and shows as active
