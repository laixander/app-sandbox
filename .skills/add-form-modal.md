# Skill: Add a Form Modal Component

## Purpose
Create an `Add<Entity>Modal.vue` component with Zod schema validation, a public `reset()` API for the parent page to seed form state, and a typed `@save` emit — following the exact structure of `app/components/AddUserModal.vue`.

## When to Use
- A CRUD page needs an Add / Edit modal with form validation
- The `add-crud-page.md` skill lists this as a prerequisite
- Any time a modal contains a form (not just a confirmation prompt — use `ConfirmationModal` for those)

## How This Differs From `ConfirmationModal`

| Aspect | `ConfirmationModal` | Form Modal (`Add<Entity>Modal`) |
|---|---|---|
| Purpose | Confirm a destructive/important action | Collect and validate user input |
| Content | Icon + message only | `UForm` with `UFormField` inputs |
| Validation | None | Zod schema |
| Public API | None (self-contained) | `defineExpose({ reset })` |
| Emit | `@confirm` / `@cancel` | `@save` with fully validated typed payload |
| Parent interaction | Open/close via `v-model:open` | Open/close + `modalRef.value?.reset(data)` before open |

## Prerequisites
- Entity type exists in `app/types/<entity>.ts`
- `zod` is available (already installed)
- `UForm`, `UFormField`, `UInput`, `UModal`, `UButton` from Nuxt UI are available

## Steps

1. **Create** `app/components/Add<Entity>Modal.vue`

2. **Write the `<script setup lang="ts">` block** — strict order matters:

   ```ts
   import * as z from 'zod'
   import type { FormSubmitEvent } from '@nuxt/ui'
   ```

3. **Declare props, models, and emits**:

   ```ts
   // Controls modal open/close from the parent via v-model:open
   const open = defineModel<boolean>('open', { default: false })

   // Tells the modal whether it's in edit or create mode
   const props = defineProps<{ isEditing: boolean }>()

   // Emits validated + typed data back to the parent page
   const emit = defineEmits<{
       save: [data: z.output<typeof schema> & { <extraField>: string }]
   }>()
   ```

   > Only include `& { <extraField>: string }` in the emit type if your state has fields not covered by the Zod schema (e.g., `avatar` which is pre-seeded and not validated). If all state fields are in the schema, simplify to `save: [data: z.output<typeof schema>]`.

4. **Define the Zod schema** for all user-entered fields:

   ```ts
   const schema = z.object({
       name:  z.string().min(1, 'Full name is required'),
       email: z.string().email('Please enter a valid email address'),
       role:  z.string().min(1, 'Job assignment is required'),
       // Add or modify fields as needed:
       // price: z.number().min(0, 'Price must be non-negative'),
       // status: z.enum(['Active', 'Inactive']),
   })

   type Schema = z.output<typeof schema>
   ```

   > Schema fields must match the `name` attributes on `<UFormField>` exactly — this is how Nuxt UI wires per-field errors.

5. **Declare `formRef` and reactive state**:

   ```ts
   const formRef = useTemplateRef('formRef')

   // State must cover all schema fields PLUS any extra pre-seeded fields (e.g. avatar)
   const state = reactive<Schema & { avatar: string }>({
       name:   '',
       email:  '',
       role:   '',
       avatar: '',  // pre-seeded by parent, not in schema
   })
   ```

   > If you have no extra fields outside the schema, simplify to `reactive<Schema>({ ... })`.

6. **Expose `reset()` as the public API**:

   ```ts
   const reset = (initial?: Partial<typeof state>) => {
       state.name   = initial?.name   ?? ''
       state.email  = initial?.email  ?? ''
       state.role   = initial?.role   ?? ''
       state.avatar = initial?.avatar ?? ''
   }

   defineExpose({ reset })
   ```

   > The parent page calls `modalRef.value?.reset(data)` before setting `isOpen = true`. This is how state is pre-populated for Edit mode without sharing form refs across components.

7. **Define `onSubmit`** — only called by Nuxt UI after Zod validation passes:

   ```ts
   async function onSubmit(event: FormSubmitEvent<Schema>) {
       // Merge schema-validated fields with any non-validated extra fields (e.g. avatar)
       emit('save', { ...event.data, avatar: state.avatar })
   }
   ```

   > If all fields are in the schema, simplify to: `emit('save', event.data)`

8. **Build the template**:

   ```html
   <template>
       <UModal v-model:open="open" :title="isEditing ? 'Modify <Entity> Details' : 'Register New <Entity>'">
           <template #body>
               <!-- ref="formRef" + :schema + :state + @submit is the required Nuxt UI form pattern -->
               <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                   <UFormField label="<Label>" name="<schemaKey>" required>
                       <UInput v-model="state.<schemaKey>" placeholder="..." class="w-full" />
                   </UFormField>
                   <!-- Repeat for each field -->
               </UForm>
           </template>

           <template #footer>
               <div class="flex justify-end gap-2">
                   <!-- Sets open = false directly — no emit needed for cancel -->
                   <UButton variant="ghost" color="neutral" @click="open = false">Dismiss</UButton>
                   <!-- Triggers UForm validation programmatically from outside the <form> DOM -->
                   <UButton color="primary" @click="formRef?.submit()">
                       {{ isEditing ? 'Save Changes' : 'Save Record' }}
                   </UButton>
               </div>
           </template>
       </UModal>
   </template>
   ```

## Full Component Template

```vue
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// ── Props, Models & Emits ────────────────────────────────────────────────────
const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{ isEditing: boolean }>()

const emit = defineEmits<{
    save: [data: z.output<typeof schema> & { avatar: string }]
}>()

// ── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
    name:  z.string().min(1, 'Full name is required'),
    role:  z.string().min(1, 'Job assignment is required'),
    email: z.string().email('Please enter a valid email address'),
})

type Schema = z.output<typeof schema>

// ── State ────────────────────────────────────────────────────────────────────
const formRef = useTemplateRef('formRef')

const state = reactive<Schema & { avatar: string }>({
    name:   '',
    role:   '',
    email:  '',
    avatar: '',
})

// ── Public API ───────────────────────────────────────────────────────────────
const reset = (initial?: Partial<typeof state>) => {
    state.name   = initial?.name   ?? ''
    state.role   = initial?.role   ?? ''
    state.email  = initial?.email  ?? ''
    state.avatar = initial?.avatar ?? ''
}

defineExpose({ reset })

// ── Handlers ─────────────────────────────────────────────────────────────────
async function onSubmit(event: FormSubmitEvent<Schema>) {
    emit('save', { ...event.data, avatar: state.avatar })
}
</script>

<template>
    <UModal v-model:open="open" :title="isEditing ? 'Modify Profile Details' : 'Register New Profile'">
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Full Name" name="name" required>
                    <UInput v-model="state.name" placeholder="John Doe" class="w-full" />
                </UFormField>
                <UFormField label="Job Assignment" name="role" required>
                    <UInput v-model="state.role" placeholder="Systems Engineer" class="w-full" />
                </UFormField>
                <UFormField label="Electronic Mail" name="email" required>
                    <UInput v-model="state.email" type="email" placeholder="john.doe@enterprise.io" class="w-full" />
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

## How the Parent Page Consumes This Component

```ts
// In the parent CRUD page (add-crud-page.md pattern):
const isOpen = ref(false)
const isEditing = ref(false)
const modalRef = useTemplateRef('modalRef')

// Create flow: reset to blank + auto-seed avatar
const openCreateModal = () => {
    isEditing.value = false
    modalRef.value?.reset({ avatar: SeederService.generateSingleUser().avatar })
    isOpen.value = true
}

// Edit flow: reset with existing record data
const openEditModal = (user: User) => {
    isEditing.value = true
    modalRef.value?.reset({ name: user.name, role: user.role, email: user.email, avatar: user.avatar })
    isOpen.value = true
}

// @save is only called after Zod validation passes
const handleSave = (data: { name: string; role: string; email: string; avatar: string }) => {
    if (isEditing.value) {
        pendingSaveData.value = data
        isOpen.value = false
        isEditConfirmOpen.value = true  // show ConfirmationModal
    } else {
        const newUser = { id: crypto.randomUUID(), ...data }
        store.createUser(newUser)
        log('Users', 'created', `Created user "${data.name}"`, { meta: { id: newUser.id } })
        isOpen.value = false
        toast.success('User Created', `${data.name} has been added.`)
    }
}
```

```html
<!-- In the parent template: -->
<Add<Entity>Modal ref="modalRef" v-model:open="isOpen" :is-editing="isEditing" @save="handleSave" />
```

## Conventions
- **File location**: `app/components/Add<Entity>Modal.vue` — auto-imported by Nuxt, no manual import needed
- **`defineModel('open')`** — always use the named model (`v-model:open`) — not `v-model` alone
- **Schema field names** must exactly match the `name` attribute on `<UFormField>` — this wires per-field error display
- **`reactive<Schema & { extra }>({})`** — use `reactive`, not `ref` — `UForm` requires a plain reactive object for `:state`
- **`formRef?.submit()`** — the Save button is in `#footer` which is outside the `<form>` DOM tree, so it cannot be `type="submit"`. Always use `formRef?.submit()` to trigger Nuxt UI's validation programmatically
- **`defineExpose({ reset })`** — always exposed, always the only public method. Never expose `state` directly
- **`onSubmit` only fires after validation passes** — no need to validate manually inside the handler
- **Extra non-validated fields** (like `avatar`) go into `state` but not into the Zod schema; merge them manually in `onSubmit` via `{ ...event.data, avatar: state.avatar }`
- **No store calls, no toasts, no routing** inside this component — it is purely a form UI. All side effects happen in the parent page's `handleSave`
- **No `async` needed** in `onSubmit` unless you add an actual async operation — keep it sync by default
- Use `import * as z from 'zod'` — not `import { z } from 'zod'`

## Output / Deliverables
- `app/components/Add<Entity>Modal.vue` — validated form modal component

## Verification
- `pnpm typecheck` passes with no errors
- Open the modal in create mode — all fields are blank, avatar is pre-seeded
- Open the modal in edit mode — all fields are pre-populated with existing record values
- Submit with empty fields — per-field Zod errors appear under each input
- Submit with valid data — `@save` fires with correctly typed payload, modal closes
- Dismiss button closes modal without emitting anything
- Reopening the modal after dismiss — fields reset correctly via `reset()`
