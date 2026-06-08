# Skill: Add a CRUD Page

## Purpose
Create a full CRUD page for a given entity with list/card view toggle, `Empty` states, `ConfirmationModal` for destructive actions, toast notifications, and `UDropdownMenu` row actions — following the exact structure of `app/pages/index.vue`.

## When to Use
- A new entity has a type, store, and seeder methods but no UI yet
- Adding a new route/page to the app

## Prerequisites
- Entity type exists in `app/types/<entity>.ts`
- `app/utils/seeder.ts` has `generateSingle<Entity>()`, `generate<Entity>s()`, and `clear<Entity>s()`
- Pinia store exists at `app/stores/<entity>Store.ts` with `deployMockData`, `removeMockData`, `create<Entity>`, `update<Entity>`, `delete<Entity>`, `isLoading`, `has<Entity>s`, `<entity>Count`
- `app/layouts/default.vue` is in place (provides `USidebar`, `PageHeading` slot, `.scrollbar` scroller)

## Steps

1. **Create** `app/pages/<entity>.vue`

2. **Set up `definePageMeta`** at the very top of `<script setup>`:
   ```ts
   definePageMeta({
       title: '<Page Title>',
       isTable: true,   // enables flex-col overflow-hidden layout in default.vue
   })
   ```
   > `isTable: true` makes the layout set `flex flex-col overflow-hidden min-h-0` on the content wrapper so the table or card grid fills and scrolls within the viewport correctly.

3. **Import dependencies**:
   ```ts
   import { ref, h, computed } from 'vue'
   import { UAvatar, UBadge, UIcon, UButton, UDropdownMenu } from '#components'
   import { use<Entity>Store } from '~/stores/<entity>Store'
   import { SeederService } from '~/utils/seeder'
   import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
   ```

4. **Set up store and toast**:
   ```ts
   const store = use<Entity>Store()
   const toast = useAppToast()

   type <Entity> = typeof store.<entities>[0]
   ```

5. **Define modal state refs**:
   ```ts
   const isOpen = ref(false)
   const isEditing = ref(false)
   const current<Entity>Id = ref<string | null>(null)

   const form = ref({
       field1: '',
       field2: '',
       // ... all editable fields (exclude id)
   })
   ```

6. **Define modal handlers**:
   ```ts
   const openCreateModal = () => {
       isEditing.value = false
       current<Entity>Id.value = null
       form.value = {
           field1: '',
           // For image/avatar fields: SeederService.generateSingle<Entity>().<imageField>
       }
       isOpen.value = true
   }

   const openEditModal = (item: <Entity>) => {
       isEditing.value = true
       current<Entity>Id.value = item.id
       form.value = { field1: item.field1, ... }
       isOpen.value = true
   }

   // For edits: close form first, then show confirmation
   const handleSave = () => {
       if (isEditing.value && current<Entity>Id.value) {
           isOpen.value = false
           isEditConfirmOpen.value = true
       } else {
           store.create<Entity>({ id: crypto.randomUUID(), ...form.value })
           isOpen.value = false
           toast.success('<Entity> Created', `${form.value.<nameField>} has been added.`)
       }
   }

   const confirmSave = () => {
       if (current<Entity>Id.value) {
           store.update<Entity>(current<Entity>Id.value, { ...form.value })
           toast.success('<Entity> Updated', `${form.value.<nameField>}'s profile has been saved.`)
       }
   }
   ```

7. **Define confirmation modal state and delete handlers**:
   ```ts
   const isDeleteConfirmOpen = ref(false)
   const isEditConfirmOpen = ref(false)
   const pendingDeleteId = ref<string | null>(null)

   const promptDelete = (id: string) => {
       pendingDeleteId.value = id
       isDeleteConfirmOpen.value = true
   }

   const confirmDelete = () => {
       if (pendingDeleteId.value) {
           store.delete<Entity>(pendingDeleteId.value)
           toast.error('<Entity> Deleted', 'The record has been permanently removed.')
           pendingDeleteId.value = null
       }
   }
   ```

8. **Define `tableColumns: TableColumn<Entity>[]`** using `h()` render functions:
   - **Name/avatar column**: combine `UAvatar` and `span` in a `div.flex.items-center.gap-2.5`
   - **Text columns**: `h('span', { class: '' }, value)`
   - **Email/link column**: `h('span', { class: 'flex items-center gap-1' }, [h(UIcon, {...}), value])`
   - **ID column**: `h(UBadge, { label: id.slice(0,8), variant: 'soft', color: 'neutral', class: 'font-mono text-[11px]' })`
   - **Actions column**: use `UDropdownMenu` with `[[Edit], [Delete]]` item groups:
     ```ts
     {
         id: 'actions',
         header: '',
         meta: { class: { td: 'text-right' } },
         cell: ({ row }) => {
             const items: DropdownMenuItem[][] = [
                 [{ label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => openEditModal(row.original) }],
                 [{ label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => promptDelete(row.original.id) }]
             ]
             return h(UDropdownMenu, { items, content: { align: 'end' }, size: 'sm' }, {
                 default: () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost', size: 'sm' })
             })
         }
     }
     ```

9. **Define table filter refs**:
   ```ts
   const table = useTemplateRef('table')
   const globalFilter = ref('')
   const columnVisibility = ref({ id: false })  // hide ID column by default
   ```

10. **Define viewMode and card filter computed**:
    ```ts
    const viewMode = ref<'list' | 'card'>('list')
    const filtered<Entity>s = computed(() => {
        if (!globalFilter.value) return store.<entities>
        const search = globalFilter.value.toLowerCase()
        return store.<entities>.filter(item =>
            item.<nameField>.toLowerCase().includes(search) ||
            item.<emailField>.toLowerCase().includes(search) ||
            // ... any other searchable fields
            item.id.toLowerCase().includes(search)
        )
    })
    ```

11. **Build the template** — follow this exact structure:

    ```html
    <!-- Page header with filter/toggle controls -->
    <PageHeading forTable title="<Entities>" description="<Description>">
        <div class="flex gap-2">
            <TableGlobalFilter v-model="globalFilter" />
            <TableColumnToggle v-if="viewMode === 'list'" :table="table" />
            <UTabs v-model="viewMode" variant="pill" size="xs" :content="false" :items="[
                { value: 'card', icon: 'i-lucide-grid-2x2' },
                { value: 'list', icon: 'i-lucide-list' },
            ]" />
        </div>
    </PageHeading>

    <ClientOnly>
        <!-- List (table) view -->
        <UTable v-if="viewMode === 'list'" :data="store.<entities>" :columns="tableColumns"
            :loading="store.isLoading" v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" sticky ref="table" class="flex-1 scrollbar">
            <template #empty>
                <Empty :loading="store.isLoading" title="No <entities> found"
                    description="..." icon="i-lucide-<icon>" loading-title="Loading <Entities>"
                    loading-description="Please wait while we fetch your records.">
                    <template #action>
                        <UButton label="Add First <Entity>" icon="i-lucide-plus" color="primary" size="lg"
                            @click="openCreateModal()" />
                    </template>
                </Empty>
            </template>
        </UTable>

        <!-- Card view -->
        <div v-else class="flex-1 overflow-y-auto scrollbar p-4">
            <div v-if="filtered<Entity>s.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <UCard v-for="item in filtered<Entity>s" :key="item.id" variant="subtle"
                    :ui="{ header: 'flex items-center justify-between gap-4', footer: 'p-0 sm:p-0' }" class="shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UAvatar :src="item.<imageField>" :alt="item.<nameField>" size="lg" />
                            <div class="text-sm font-bold truncate">{{ item.<nameField> }}</div>
                        </div>
                        <UDropdownMenu :items="[[
                            { label: 'Edit', icon: 'i-lucide-edit', onSelect: () => openEditModal(item) }
                        ], [
                            { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => promptDelete(item.id) }
                        ]]" :content="{ align: 'end' }" size="sm">
                            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
                        </UDropdownMenu>
                    </template>
                    <!-- Key-value body -->
                    <div class="*:py-2 *:first:pt-0 *:last:pb-0 *:flex *:items-center *:justify-between text-sm divide-y divide-default">
                        <div>
                            <div class="text-muted w-full">ID</div>
                            <UBadge :label="item.id.slice(0, 8)" variant="soft" color="neutral" />
                        </div>
                        <!-- Repeat for other fields -->
                    </div>
                </UCard>
            </div>
            <Empty v-else :loading="store.isLoading" title="No <entities> found" ... />
        </div>
    </ClientOnly>

    <!-- Confirmation Modals -->
    <ConfirmationModal v-model:open="isEditConfirmOpen" title="Save changes?"
        description="Are you sure you want to update this record?" confirm-label="Yes, Save"
        confirm-color="warning" @confirm="confirmSave" />

    <ConfirmationModal v-model:open="isDeleteConfirmOpen" title="Delete <entity>?"
        description="This will permanently remove the record. This action cannot be undone."
        confirm-label="Yes, Delete" confirm-color="error" @confirm="confirmDelete" />

    <!-- Add / Edit Modal -->
    <UModal v-model:open="isOpen" :title="isEditing ? 'Modify <Entity> Details' : 'Register New <Entity>'">
        <template #body>
            <div class="space-y-4">
                <UFormField label="..." required>
                    <UInput v-model="form.<field>" placeholder="..." class="w-full" />
                </UFormField>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton variant="ghost" color="neutral" @click="isOpen = false">Dismiss</UButton>
                <UButton color="primary" @click="handleSave">{{ isEditing ? 'Save Changes' : 'Save Record' }}</UButton>
            </div>
        </template>
    </UModal>
    ```

## Conventions
- **`definePageMeta` must be first** in `<script setup>` — before all imports
- **`isTable: true`** in `definePageMeta` is required for pages with a full-height table or card grid
- **`PageHeading` with `forTable` prop** replaces page headers — do NOT write a custom `<header>` element
- **`TableGlobalFilter`** is always shown; **`TableColumnToggle`** is only shown when `viewMode === 'list'`
- **`viewMode`** values are `'list'` and `'card'` (NOT `'table'`)
- **`filteredUsers` / `filtered<Entity>s`** must be used in card view for search to work — the table handles filtering natively via `v-model:global-filter`
- **`UDropdownMenu`** is the only allowed row action pattern — never use inline Edit/Delete buttons
- **`ConfirmationModal`** is required for all destructive actions (delete) and for edit saves
- **`useAppToast()`** is auto-imported — use `toast.success()` for creates/updates and `toast.error()` for deletes
- **`columnVisibility`** should default to `{ id: false }` to hide the ID column
- **`<ClientOnly>`** wraps only the table/card data section — NOT the `PageHeading`
- **`Empty`** component is used in two places: inside `UTable`'s `#empty` slot AND as a fallback in card view when `filtered<Entity>s.length === 0`
- **`crypto.randomUUID()`** for `id` on new records — never `Math.random()`
- Do NOT use inline `v-model` on UModal — always use `v-model:open`

## Output / Deliverables
- `app/pages/<entity>.vue` — full CRUD page

## Verification
- `pnpm typecheck` passes with no errors
- Navigate to `/<entity>` in the browser — page renders without layout shift
- List and Card views toggle correctly
- `TableGlobalFilter` search works in both views
- `TableColumnToggle` shows/hides columns in list view
- Add modal opens, saves, and record appears immediately with a success toast
- Edit flow: modal closes → confirmation modal → save → success toast
- Delete flow: confirmation modal → delete → error-colored toast
- Refresh shows the same data (localStorage persistence confirmed)
