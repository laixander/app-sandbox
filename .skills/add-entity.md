# Skill: Add a New Entity

## Purpose
Scaffold a complete new entity — type definition, Pinia store, seeder support, and CRUD page — following app-sandbox's established patterns.

## When to Use
- Adding a new data entity to the app (e.g., Products, Orders, Tasks)
- Introducing a new page with list/card view and full CRUD support

## Prerequisites
- The app is running with `bun run dev` or `pnpm dev`
- `@faker-js/faker` is available as a dev dependency
- Existing stores (`app/stores/`), types (`app/types/`), and pages (`app/pages/`) are present for reference
- `app/layouts/default.vue` is in place

## Steps

Run each sub-skill in this order. Each step has its own dedicated skill file for detailed instructions.

### Step 1 — Add the TypeScript interface
> **Skill**: `.skills/add-type.md`

Create `app/types/<entity>.ts` with a named `export interface <Entity>`. Every entity must have `id: string` as its first field. Then re-export the type from `app/utils/seeder.ts` so stores can import both type and seeder from a single location.

```ts
// app/types/product.ts
export interface Product {
  id: string
  name: string
  price: number
  category: 'Electronics' | 'Clothing' | 'Books'
  image: string
}
```

### Step 2 — Extend the seeder
> **Skill**: `.skills/add-seeder-entity.md`

Add three methods to `SeederService` in `app/utils/seeder.ts`:
- `generateSingle<Entity>(): <Entity>`
- `generate<Entity>s(count: number = 5): <Entity>[]`
- `clear<Entity>s(): <Entity>[]`

Also add the import and re-export of the new type at the top of the file.

### Step 3 — Create the Pinia store
> **Skill**: `.skills/add-store.md`

Create `app/stores/<entity>Store.ts` using the **options API style**. Required shape:

```ts
export const use<Entity>Store = defineStore('<entity>Store', {
  state: () => ({
    <entities>: [] as <Entity>[],
    isLoading: false,
  }),
  actions: {
    deployMockData(count: number = 6) { ... },  // setTimeout 500ms
    removeMockData() { ... },                    // setTimeout 300ms
    create<Entity>(item: <Entity>) { this.<entities>.unshift(item) },
    update<Entity>(id: string, data: Partial<<Entity>>) { ... },
    delete<Entity>(id: string) { ... }
  },
  getters: {
    <entity>Count: (state) => state.<entities>.length,
    has<Entity>s: (state) => state.<entities>.length > 0
  },
  persist: { storage: persistedState.localStorage }
})
```

### Step 4 — Create the CRUD page
> **Skill**: `.skills/add-crud-page.md`

Create `app/pages/<entity>.vue`. Key requirements:
- `definePageMeta({ title: '...', isTable: true })` must be the first statement
- Use `PageHeading` with `forTable` prop for the page header
- Use `TableGlobalFilter` + `TableColumnToggle` + `UTabs` in the `PageHeading` default slot
- `viewMode` values: `'list'` | `'card'` (NOT `'table'`)
- Table view: `<UTable>` with `sticky`, `ref="table"`, `v-model:column-visibility`, `v-model:global-filter`
- Table empty state: `<UEmpty variant="naked">` in `#empty` slot
- Card view: `filtered<Entity>s` computed for search-aware rendering; `md:grid-cols-2 lg:grid-cols-4` grid
- Card header: avatar + name on left, `UDropdownMenu` with `[[Edit], [Delete]]` on right
- Card body: key-value rows with `divide-y divide-default`
- Delete and Edit save flows both use `ConfirmationModal`
- All notifications via `useAppToast()`

### Step 5 — Register the page in the sidebar nav (if applicable)
Open `app/layouts/default.vue` and add a nav item to the `items` array:

```ts
{ label: '<Entity>s', icon: 'i-lucide-<icon>', to: '/<entity>' }
```

## Conventions
- **Type file**: one interface, named export, no logic
- **Seeder**: three methods per entity (`generateSingle*`, `generate*s`, `clear*s`), pure functions
- **Store**: options API, `unshift()` for new records, `setTimeout` for async simulation, `persistedState.localStorage`
- **Page**: `definePageMeta` first, `isTable: true`, `PageHeading` with `forTable`, `UDropdownMenu` for actions, `ConfirmationModal` for destructive actions, `useAppToast()` for all notifications
- **IDs**: `faker.string.uuid()` in seeder, `crypto.randomUUID()` in manual creates

## Output / Deliverables
- `app/types/<entity>.ts` — new TypeScript interface
- `app/utils/seeder.ts` — updated with new generator methods and type re-export
- `app/stores/<entity>Store.ts` — new Pinia store with full CRUD + persist
- `app/pages/<entity>.vue` — new CRUD page with list/card view and modals
- `app/layouts/default.vue` — sidebar nav item added (if applicable)

## Verification
- `pnpm typecheck` passes with no errors
- Dev server shows no console errors
- "Deploy" button (in `DemoFab`) seeds data and records render in list view
- List ↔ Card toggle works; `TableGlobalFilter` filters in both views
- `TableColumnToggle` shows/hides columns in list view
- Add/Edit/Delete flows work end to end with toast confirmations
- Refresh preserves data (localStorage persistence confirmed)
