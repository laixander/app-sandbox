# Skill: Add a CRUD Page

## Purpose
Create a full CRUD page for a given entity with list/card view toggle, `UEmpty` states, `ConfirmationModal` for destructive actions, toast notifications, `UDropdownMenu` row actions, and `useActivityLog` audit trail — following the exact structure of `app/pages/crud.vue`.

## When to Use
- A new entity has a type, store, and seeder methods but no UI yet
- Adding a new route/page to the app

## Prerequisites
- Entity type exists in `app/types/<entity>.ts`
- `app/utils/seeder.ts` has `generateSingle<Entity>()`, `generate<Entity>s()`, and `clear<Entity>s()`
- Pinia store exists at `app/stores/<entity>Store.ts` with `deployMockData`, `removeMockData`, `create<Entity>`, `update<Entity>`, `delete<Entity>`, `isLoading`, `has<Entity>s`, `<entity>Count`
- `app/layouts/default.vue` is in place (provides `USidebar`, `#header-actions-teleport` div, `.scrollbar` scroller)
- An `Add<Entity>Modal` component exists at `app/components/Add<Entity>Modal.vue` with a `reset()` expose and `@save` emit — **use `.skills/add-form-modal.md` to create it first if it doesn't exist**

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

4. **Set up store, toast, activity log, and notifications**:
   ```ts
   const store = use<Entity>Store()
   const toast = useAppToast()
   const { log } = useActivityLog()
   const { notify } = useNotify()   // optional — for user-facing alerts

   type <Entity> = typeof store.<entities>[0]
   ```

5. **Define modal state refs**:
   ```ts
   const isOpen = ref(false)
   const isEditing = ref(false)
   const current<Entity>Id = ref<string | null>(null)
   // Stash validated form data between the form modal and the edit confirmation modal
   const pendingSaveData = ref<{ field1: string; field2: string; ... } | null>(null)
   const modalRef = useTemplateRef('modalRef')
   ```

6. **Define modal handlers** — the form modal calls `@save` with already-validated data:
   ```ts
   const openCreateModal = () => {
       isEditing.value = false
       current<Entity>Id.value = null
       // reset() is exposed by the Add<Entity>Modal component
       modalRef.value?.reset({ <imageField>: SeederService.generateSingle<Entity>().<imageField> })
       isOpen.value = true
   }

   const openEditModal = (item: <Entity>) => {
       isEditing.value = true
       current<Entity>Id.value = item.id
       modalRef.value?.reset({
           field1: item.field1,
           field2: item.field2,
           // ... all editable fields
       })
       isOpen.value = true
   }

   // handleSave receives already-validated data from the modal's @save emit
   const handleSave = (data: { field1: string; field2: string; ... }) => {
       if (isEditing.value && current<Entity>Id.value) {
           // Stash data, close form, show confirmation
           pendingSaveData.value = data
           isOpen.value = false
           isEditConfirmOpen.value = true
       } else {
           const newItem = { id: crypto.randomUUID(), ...data }
           store.create<Entity>(newItem)
           log('<Entity>s', 'created', `Created <entity> "${data.<nameField>}"`, { meta: { id: newItem.id } })
           isOpen.value = false
           toast.success('<Entity> Created', `${data.<nameField>} has been added.`)
       }
   }

   const confirmSave = () => {
       if (current<Entity>Id.value && pendingSaveData.value) {
           store.update<Entity>(current<Entity>Id.value, { ...pendingSaveData.value })
           log('<Entity>s', 'updated', `Updated <entity> "${pendingSaveData.value.<nameField>}"`, { meta: { id: current<Entity>Id.value } })
           toast.success('<Entity> Updated', `${pendingSaveData.value.<nameField>} has been saved.`)
           pendingSaveData.value = null
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
           const item = store.<entities>.find(e => e.id === pendingDeleteId.value)
           store.delete<Entity>(pendingDeleteId.value)
           log('<Entity>s', 'deleted', `Deleted <entity> "${item?.<nameField> ?? 'Unknown'}"`, { meta: { id: pendingDeleteId.value } })
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
            item.id.toLowerCase().includes(search)
        )
    })
    ```

11. **Create the form modal component** — `app/components/Add<Entity>Modal.vue`

    Extract the add/edit form into its own component with Zod validation:
    - Use `defineModel<boolean>('open')` to control visibility from the parent
    - Own the form state internally with `reactive<Schema & { avatar: string }>({...})`
    - Expose a `reset(initial?)` method via `defineExpose` — the parent calls this to seed data before opening
    - Use `useTemplateRef('formRef')` on `<UForm>` and call `formRef?.submit()` from the footer button (the button lives in `#footer` slot, outside the form DOM)
    - Emit `@save` with the fully-validated data payload after Zod passes

    ```vue
    <script setup lang="ts">
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'

    const open = defineModel<boolean>('open', { default: false })
    const props = defineProps<{ isEditing: boolean }>()
    const emit = defineEmits<{ save: [data: z.output<typeof schema> & { avatar: string }] }>()

    const schema = z.object({
        field1: z.string().min(1, 'Field 1 is required'),
        email: z.string().email('Please enter a valid email address'),
    })
    type Schema = z.output<typeof schema>

    const formRef = useTemplateRef('formRef')

    const state = reactive<Schema & { avatar: string }>({
        field1: '', email: '', avatar: ''
    })

    const reset = (initial?: Partial<typeof state>) => {
        state.field1  = initial?.field1  ?? ''
        state.email   = initial?.email   ?? ''
        state.avatar  = initial?.avatar  ?? ''
    }
    defineExpose({ reset })

    async function onSubmit(event: FormSubmitEvent<Schema>) {
        emit('save', { ...event.data, avatar: state.avatar })
    }
    </script>

    <template>
        <UModal v-model:open="open" :title="isEditing ? 'Modify <Entity> Details' : 'Register New <Entity>'">
            <template #body>
                <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                    <UFormField label="..." name="field1" required>
                        <UInput v-model="state.field1" placeholder="..." class="w-full" />
                    </UFormField>
                </UForm>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton variant="ghost" color="neutral" @click="open = false">Dismiss</UButton>
                    <UButton color="primary" @click="formRef?.submit()">
                        {{ isEditing ? 'Save Changes' : 'Save Record' }}
                    </UButton>
                </div>
            </template>
        </UModal>
    </template>
    ```

12. **Build the template** — follow this exact structure:

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
        <!-- Teleport header action buttons into the layout's header bar -->
        <Teleport to="#header-actions-teleport">
            <UButton color="primary" icon="i-lucide-plus" label="Add <Entity>" @click="openCreateModal()" />
        </Teleport>

        <!-- List (table) view -->
        <UTable v-if="viewMode === 'list'" :data="store.<entities>" :columns="tableColumns"
            :loading="store.isLoading" v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" sticky ref="table" class="flex-1 scrollbar">
            <template #empty>
                <UEmpty variant="naked" icon="i-lucide-<icon>" title="No <entities> found"
                    description="...">
                    <template #actions>
                        <UButton label="Add First <Entity>" icon="i-lucide-plus" color="primary" size="lg"
                            @click="openCreateModal()" />
                    </template>
                </UEmpty>
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
                    </div>
                </UCard>
            </div>
            <div v-else-if="store.isLoading" class="flex items-center justify-center h-full gap-3 text-muted">
                <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
                <p class="text-sm font-medium">Loading <entities>…</p>
            </div>
            <UEmpty v-else variant="naked" icon="i-lucide-<icon>" title="No <entities> found"
                description="...">
                <template #actions>
                    <UButton label="Add First <Entity>" icon="i-lucide-plus" color="primary" size="lg"
                        @click="openCreateModal()" />
                </template>
            </UEmpty>
        </div>
    </ClientOnly>

    <!-- Confirmation Modals -->
    <ConfirmationModal v-model:open="isEditConfirmOpen" title="Save changes?"
        description="Are you sure you want to update this record?" confirm-label="Yes, Save"
        confirm-color="warning" @confirm="confirmSave" />

    <ConfirmationModal v-model:open="isDeleteConfirmOpen" title="Delete <entity>?"
        description="This will permanently remove the record. This action cannot be undone."
        confirm-label="Yes, Delete" confirm-color="error" @confirm="confirmDelete" />

    <!-- Add / Edit Modal (component with ref for reset() and @save emit) -->
    <Add<Entity>Modal ref="modalRef" v-model:open="isOpen" :is-editing="isEditing" @save="handleSave" />
    ```

## Conventions
- **`definePageMeta` must be first** in `<script setup>` — before all imports
- **`isTable: true`** in `definePageMeta` is required for pages with a full-height table or card grid
- **`PageHeading` with `forTable` prop** replaces page headers — do NOT write a custom `<header>` element
- **`TableGlobalFilter`** is always shown; **`TableColumnToggle`** is only shown when `viewMode === 'list'`
- **`viewMode`** values are `'list'` and `'card'` (NOT `'table'`)
- **`filtered<Entity>s`** must be used in card view for search to work — the table handles filtering natively via `v-model:global-filter`
- **`UDropdownMenu`** is the only allowed row action pattern — never use inline Edit/Delete buttons
- **`ConfirmationModal`** is required for all destructive actions (delete) and for edit saves
- **`useAppToast()`** is auto-imported — use `toast.success()` for creates/updates and `toast.error()` for deletes
- **`useActivityLog()`** is auto-imported — call `log(module, action, description, { meta })` on every create, update, and delete. Do NOT log seeder/mock-data operations
- **`useNotify()`** is auto-imported — optionally call `notify(title, body, type, module)` alongside `log()` for important outcomes the **current user** should be alerted to. These are complementary — `log()` writes to the admin audit trail; `notify()` writes to the user's notification feed.

  | | `useActivityLog()` | `useNotify()` |
  |---|---|---|
  | Visible to | Admins (Activity Logs page) | Current user (Notifications page) |
  | Purpose | Audit trail of all data changes | User-facing alerts for important outcomes |
  | Required? | **Yes** — call on every CUD action | **Optional** — only for notable events |
  | Call from seeders? | ❌ Never | ❌ Never |
- **`pendingSaveData`** ref bridges validated form data from the form modal to the edit `confirmSave` handler
- **`modalRef` + `reset()`** — the form modal must expose a `reset(initialData)` method; the page calls it via `useTemplateRef('modalRef')` before opening
- **`<Teleport to="#header-actions-teleport">`** inside `<ClientOnly>` — use this to place primary action buttons (e.g., "Add User") in the layout header bar
- **`columnVisibility`** should default to `{ id: false }` to hide the ID column
- **`<ClientOnly>`** wraps the table/card section AND the `<Teleport>` — NOT the `PageHeading`
- **`UEmpty`** is used in two places: inside `UTable`'s `#empty` slot AND as a fallback in card view when `filtered<Entity>s.length === 0`
- Always use `variant="naked"` — avoids double-bordered appearance inside tables or padded containers
- Use the `#actions` slot for action buttons (not the `actions` prop) when a click handler is needed
- In the **table `#empty` slot**: `UTable`'s own `:loading` handles the loading state — `UEmpty` only renders when NOT loading and data is empty
- In the **card view fallback**: chain `v-if` (has data) → `v-else-if="store.isLoading"` (loading spinner) → `v-else` (`UEmpty`) since card view has no built-in loading indicator
- **`crypto.randomUUID()`** for `id` on new records — never `Math.random()`
- Do NOT use `v-model` on UModal — always use `v-model:open`
- The form modal (`Add<Entity>Modal`) handles its own Zod validation and only emits `@save` with clean, validated data — the page never reads raw form refs directly — always use `v-model:open`
- **Extract the form modal** into `app/components/Add<Entity>Modal.vue` — never inline `<UModal>` with a form directly in the page
- **`formRef?.submit()`** — the standard way to trigger form validation from a button in a `#footer` slot that is outside the `<UForm>` DOM tree

## Output / Deliverables
- `app/pages/<entity>.vue` — full CRUD page
- `app/components/Add<Entity>Modal.vue` — extracted form modal with Zod schema

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
