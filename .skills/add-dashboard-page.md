# Skill: Add a Dashboard Page

## Purpose
Create a non-table overview/summary page using `StatCard` components, Chart.js charts, and a dedicated Pinia store — seeded with realistic fake data via `SeederService` and controlled by `DemoFab`. This is the **standard pattern** for all dashboard-style pages.

## When to Use
- Adding a home screen, overview, or summary page for an entity or section
- The page primarily shows KPI numbers, charts, or summary grids — NOT a paginated data table
- The page uses `StatCard` components and does NOT need `isTable: true`

## Prerequisites
- `app/components/StatCard.vue` is available
- `app/layouts/default.vue` is in place
- `@faker-js/faker` is installed
- `app/components/DemoFab.vue` is present

## How This Differs From a CRUD Page

| Aspect | CRUD Page (`add-crud-page.md`) | Dashboard Page (this skill) |
|---|---|---|
| `isTable` in `definePageMeta` | `true` | `false` (or omit) |
| Content wrapper | `flex flex-col overflow-hidden min-h-0` | `p-4 sm:p-6 overflow-y-auto scrollbar` |
| Primary component | `UTable` / card grid | `StatCard` grid + charts |
| `PageHeading` | With `forTable` prop | Without `forTable` prop |
| Scrolling | Table/card grid scrolls internally | Entire page content scrolls |
| Empty state | `<UEmpty variant="naked">` | Usually not needed (shows `—` placeholder values) |
| Mock data source | `userStore` | Dedicated `<name>Store` backed by `SeederService` |

## Steps

### 1. Define Types — `app/types/<name>.ts`

Create typed shapes for stat cards, chart datasets, and the full dashboard data object:

```ts
// Reuse generic types from app/types/dashboard.ts:
import type { StatCardData, ChartDataPoint } from '~/types/dashboard'

export interface MyDashboardData {
  statCards: StatCardData[]
  activityData: ChartDataPoint
  // ... one ChartDataPoint per chart
}
```

> **Tip:** Reuse `StatCardData` and `ChartDataPoint` from `app/types/dashboard.ts` — they are generic enough for any dashboard.

### 2. Add Seeder Methods — `app/utils/seeder.ts`

Add `generate<Name>()` and `clear<Name>()` methods to `SeederService` following the `generateDashboard` / `clearDashboard` pattern:

```ts
import type { MyDashboardData } from '../types/<name>'

// inside SeederService:
generateMyDashboard(): MyDashboardData {
  return {
    statCards: [ /* faker-generated StatCardData items */ ],
    activityData: { labels: [...], datasets: [{ label: '...', data: randInts(7, 100, 1000), ... }] },
    // ... all other charts
  }
},

clearMyDashboard(): MyDashboardData {
  const emptyChart = (): ChartDataPoint => ({ labels: [], datasets: [] })
  return {
    statCards: [ /* placeholder items with value: '—' */ ],
    activityData: emptyChart(),
    // ...
  }
},
```

**Faker helpers available:**
| Field | Recommended method |
|---|---|
| Integer in range | `faker.number.int({ min, max })` |
| Enum / status | `faker.helpers.arrayElement(['a', 'b'] as const)` |
| Percentage trend | `` `${faker.number.int({ min: 1, max: 25 })}% from last month` `` |
| Formatted number | `faker.number.int({ min, max }).toLocaleString()` |

### 3. Create the Store — `app/stores/<name>Store.ts`

Follow the options-API style (same as `userStore`, `dashboardStore`):

```ts
import { defineStore } from 'pinia'
import { SeederService } from '~/utils/seeder'
import type { MyDashboardData } from '~/types/<name>'

const getEmptyState = (): MyDashboardData => SeederService.clearMyDashboard()

export const use<Name>Store = defineStore('<name>Store', {
  state: () => ({ ...getEmptyState(), isLoading: false }),

  actions: {
    deployMockData() {
      this.isLoading = true
      setTimeout(() => {
        const data = SeederService.generateMyDashboard()
        Object.assign(this, data)
        this.isLoading = false
      }, 500)
    },
    removeMockData() {
      this.isLoading = true
      setTimeout(() => {
        Object.assign(this, getEmptyState())
        this.isLoading = false
      }, 300)
    },
  },

  getters: {
    has<Name>Data: (state) => state.statCards.some(c => c.value !== '—'),
  },

  persist: { storage: persistedState.localStorage }
})
```

### 4. Build the Page — `app/pages/<name>.vue`

```html
<script setup lang="ts">
definePageMeta({ title: '<Page Title>' })

import { Line, Bar, Doughnut, Radar, PolarArea } from 'vue-chartjs'
import { use<Name>Store } from '~/stores/<name>Store'

const store = use<Name>Store()
const { legendLabels, defaultOptions, doughnutOptions, polarAreaOptions, radarOptions } = useChart()
</script>

<template>
  <!-- Stat Cards — driven by store -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    <StatCard
      v-for="card in store.statCards"
      :key="card.title"
      :title="card.title"
      :value="card.value"
      :icon="card.icon"
      :trend="card.trend"
      :trend-direction="card.trendDirection"
    />
  </div>

  <!-- Charts — bind :data directly to store properties -->
  <UCard variant="subtle" class="shadow-sm mt-6">
    <div class="h-[240px] w-full">
      <Line :data="store.activityData" :options="defaultOptions" />
    </div>
  </UCard>
</template>
```

### 5. Wire into DemoFab — `app/components/DemoFab.vue`

Import and call the store's `deployMockData()` / `removeMockData()` alongside any existing stores:

```ts
import { use<Name>Store } from '~/stores/<name>Store'
const <name>Store = use<Name>Store()

// Merge into isLoading / isDataDeployed computed:
const isLoading = computed(() => userStore.isLoading || <name>Store.isLoading)
const isDataDeployed = computed(() => userStore.hasUsers || <name>Store.has<Name>Data)

// In handleSeed:
<name>Store.deployMockData()

// In handleReset:
<name>Store.removeMockData()
```

### 6. Register the Page in the Sidebar

Open `app/layouts/default.vue` and add to the `items` array:
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
- Dashboard pages do **NOT** use `PageHeading` with the `forTable` prop
- The layout's content wrapper automatically adds `p-4 sm:p-6 overflow-y-auto scrollbar` for non-table pages
- KPI grid: use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` as the standard responsive breakpoint
- All stat card and chart data **must** come from the Pinia store — no hardcoded values in the template
- Use `UCard variant="subtle"` for chart container cards
- Do NOT wrap in `<ClientOnly>` unless the component uses browser-only APIs — `StatCard` is SSR-safe
- Sidebar nav items use `i-ph-*` for top-level entries and `i-lucide-*` for sub-items
- The `clearDashboard` / `clear<Name>` output must use `value: '—'` (em dash) as the placeholder for empty stat cards
- Do NOT store raw Chart.js objects with circular references in state — only store plain `{ labels, datasets }` objects

## File Checklist
- `app/types/<name>.ts` — type definitions (or reuse `app/types/dashboard.ts`)
- `app/utils/seeder.ts` — `generate<Name>()` and `clear<Name>()` methods added
- `app/stores/<name>Store.ts` — Pinia store with `deployMockData` / `removeMockData`
- `app/pages/<name>.vue` — page consuming store state
- `app/components/DemoFab.vue` — updated to call store's seed/reset actions
- `app/layouts/default.vue` — sidebar nav item added

## Verification
- `pnpm typecheck` passes with no errors
- Navigate to `/<name>` in the browser — page renders with placeholder `—` stat values and empty charts
- Click "Deploy Demo Data" in the DemoFab — stat cards update with random values, all charts populate
- Click "Reset System" — stat cards show `—` and charts clear
- Refresh the page — data persists correctly from localStorage
- Sidebar link navigates to the page and shows as active
