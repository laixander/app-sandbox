# Skill: Add a Wizard Page

## Purpose
Scaffold a multi-step wizard form that collects user input across sequential validated steps, submits to a store action, and shows a success screen — following the exact structure of `app/pages/wizard.vue`.

## When to Use
- A form has 3+ fields that benefit from being split across logical steps
- You want guided, progressive disclosure of a complex form (onboarding, multi-entity creation)
- The entity being created needs validation per-step before advancing

## How This Differs From a Modal Form

| Aspect | `Add<Entity>Modal` | Wizard Page |
|---|---|---|
| Location | `UModal` overlay | Dedicated full page |
| Steps | Single form | Multi-step (`UStepper`) |
| Validation | Full form on submit | Per-step (each `UForm` validates before advancing) |
| Complexity | Simple 2–5 fields | Complex multi-section flows |
| Navigation | Cancel / Submit buttons | Back / Next / Submit controls |

## Prerequisites
- Target entity type exists in `app/types/<entity>.ts`
- Store exists with a `create<Entity>(data)` action
- `useActivityLog()` and `useNotify()` composables are available

---

## Steps

### 1. Create `app/pages/<name>.vue`

### 2. Set up `definePageMeta`:
```ts
definePageMeta({ title: '<Page Title>' })
// NOTE: Do NOT use isTable: true — wizard is a scrollable form, not a table
```

### 3. Import types and set up composables:
```ts
import type { StepperItem } from '@nuxt/ui'
import { z } from 'zod'
import type { <Entity> } from '~/types/<entity>'

const store = use<Entity>Store()
const toast = useAppToast()
const { log } = useActivityLog()
const { notify } = useNotify()      // optional
```

### 4. Set up stepper state:
```ts
const stepper = useTemplateRef('stepper')
const currentStep = ref(0)
const isSubmitting = ref(false)
const createdEntity = ref<<Entity> | null>(null)

const steps = [
    { title: 'Step One',  description: 'First section',  icon: 'i-lucide-<icon>' },
    { title: 'Step Two',  description: 'Second section', icon: 'i-lucide-<icon>' },
    { title: 'Review',    description: 'Confirm details', icon: 'i-lucide-clipboard-check' },
    { title: 'Done',      description: 'Record created', icon: 'i-lucide-circle-check' },
] satisfies StepperItem[]
```

### 5. Define per-step schemas, reactive state, and form refs:
```ts
// ── Step 0 ──
const step0Schema = z.object({ field: z.string().min(2, 'Required') })
const step0Data = reactive({ field: '' })
const step0FormRef = useTemplateRef('step0Form')
const onStep0Submit = () => stepper.value?.next()

// ── Step 1 ──
const step1Schema = z.object({ ... })
const step1Data = reactive({ ... })
const step1FormRef = useTemplateRef('step1Form')
const onStep1Submit = () => stepper.value?.next()
```

### 6. Define the submit handler:
```ts
const handleSubmit = async () => {
    isSubmitting.value = true
    await new Promise(r => setTimeout(r, 600))  // async feel

    const entity: <Entity> = {
        id: crypto.randomUUID(),
        ...step0Data,
        ...step1Data,
    }

    store.create<Entity>(entity)
    log('<Module>', 'created', `Created ${entity.<nameField>} via wizard`)
    notify('<Entity> Created', `${entity.<nameField>} has been added.`, 'success', '<Module>')
    toast.success('<Entity> Created', `${entity.<nameField>} was added successfully.`)

    createdEntity.value = entity
    isSubmitting.value = false
    stepper.value?.next()
}
```

### 7. Define navigation helpers:
```ts
const handleNext = () => {
    if (currentStep.value === 0)      step0FormRef.value?.submit()
    else if (currentStep.value === 1) step1FormRef.value?.submit()
    else if (currentStep.value === 2) handleSubmit()
    // Review step (last before Done) calls handleSubmit directly
}

const handleBack = () => stepper.value?.prev()

const resetWizard = () => {
    currentStep.value = 0
    Object.assign(step0Data, { field: '' })
    Object.assign(step1Data, { ... })
    createdEntity.value = null
}
```

### 8. Build the template:
```html
<PageHeading title="<Title>" description="<Subtitle>" />

<div class="flex-1 overflow-y-auto scrollbar p-4 md:p-8">
    <div class="max-w-2xl mx-auto space-y-6">

        <!-- Stepper header -->
        <UStepper ref="stepper" v-model="currentStep" :items="steps" disabled class="w-full" />

        <!-- Step content card -->
        <UCard variant="subtle" class="shadow-sm min-h-64">
            <Transition name="wizard-slide" mode="out-in">
                <div :key="currentStep">

                    <!-- Step 0 -->
                    <div v-if="currentStep === 0" class="space-y-5">
                        <UForm ref="step0Form" :schema="step0Schema" :state="step0Data"
                            class="space-y-4" @submit="onStep0Submit">
                            <UFormField label="<Label>" name="<field>" required>
                                <UInput v-model="step0Data.field" placeholder="..." class="w-full" />
                            </UFormField>
                        </UForm>
                    </div>

                    <!-- Step 1 -->
                    <div v-else-if="currentStep === 1" class="space-y-5">
                        <UForm ref="step1Form" :schema="step1Schema" :state="step1Data"
                            class="space-y-4" @submit="onStep1Submit">
                            <!-- fields -->
                        </UForm>
                    </div>

                    <!-- Review -->
                    <div v-else-if="currentStep === 2" class="space-y-5">
                        <!-- Summary of all data -->
                        <UAlert icon="i-lucide-info" color="info" variant="soft"
                            title="Ready to submit"
                            description="Clicking 'Create' will add this record to the system immediately." />
                    </div>

                    <!-- Done -->
                    <div v-else class="flex flex-col items-center justify-center py-10 gap-5 text-center">
                        <div class="size-16 rounded-full bg-success/10 flex items-center justify-center">
                            <UIcon name="i-lucide-circle-check" class="size-8 text-success" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-lg font-bold text-highlighted">Created!</p>
                            <p class="text-sm text-muted">{{ createdEntity?.<nameField> }} was added.</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <UButton label="Add Another" icon="i-lucide-plus" color="neutral"
                                variant="soft" @click="resetWizard" />
                            <UButton label="View Records" trailing-icon="i-lucide-arrow-right" to="/<entity>" />
                        </div>
                    </div>

                </div>
            </Transition>
        </UCard>

        <!-- Navigation controls (hidden on Done step) -->
        <div v-if="currentStep < steps.length - 1" class="flex justify-between items-center">
            <UButton label="Back" icon="i-lucide-arrow-left" color="neutral" variant="ghost"
                :disabled="!stepper?.hasPrev" @click="handleBack" />
            <div class="flex items-center gap-3">
                <span class="text-xs text-muted">Step {{ currentStep + 1 }} of {{ steps.length - 1 }}</span>
                <UButton v-if="currentStep < steps.length - 2"
                    label="Next" trailing-icon="i-lucide-arrow-right"
                    :loading="isSubmitting" @click="handleNext" />
                <UButton v-else
                    label="Create <Entity>" icon="i-lucide-check"
                    :loading="isSubmitting" @click="handleNext" />
            </div>
        </div>

    </div>
</div>
```

### 9. Add the slide transition (scoped):
```css
<style scoped>
.wizard-slide-enter-active,
.wizard-slide-leave-active { transition: all 0.2s ease; }
.wizard-slide-enter-from { opacity: 0; transform: translateX(12px); }
.wizard-slide-leave-to   { opacity: 0; transform: translateX(-12px); }
</style>
```

### 10. Register in the sidebar (`app/layouts/default.vue`):
```ts
{ label: '<Label>', icon: 'i-lucide-wand-sparkles', to: '/<name>', meta: { adminOnly: true } }
```

> Add `meta: { adminOnly: true }` if only Admins should access this page.

---

## Conventions

- **`UStepper disabled`** — always set `disabled` to prevent clicking ahead; navigate only via `stepper.value.next()` / `stepper.value.prev()`
- **One `UForm` per step** — each step has its own `ref`, `:schema`, and `:state`; never share a single form across steps
- **`formRef.value?.submit()`** — the `handleNext()` dispatcher calls the active step's form submit, which runs Zod validation before advancing
- **`stepper.value?.next()`** — called from the `@submit` handler AFTER validation passes, not from `handleNext` directly
- **Review step** is always the last step before Done — it shows a summary and calls `handleSubmit()` directly from `handleNext()`
- **Done step** is index `steps.length - 1` — navigation controls are hidden on this step (`v-if="currentStep < steps.length - 1"`)
- **`resetWizard()`** — must reset `currentStep = 0`, all reactive data, and `createdEntity = null`
- **`crypto.randomUUID()`** for IDs — never `Math.random()`
- **`Object.assign(data, {...})`** — preferred pattern for resetting reactive objects (preserves reactivity)
- **`min-h-64`** on the `UCard` — prevents the card from collapsing on short steps
- **`<Transition name="wizard-slide" mode="out-in">`** with `:key="currentStep"` — drives the slide animation on step change
- **No `isTable: true`** in `definePageMeta` — wizard is a scrollable form page

---

## Output / Deliverables
- `app/pages/<name>.vue` — the wizard page
- `app/layouts/default.vue` — sidebar nav item added

## Verification
- Navigate to `/<name>` — step 0 renders with the stepper showing step 1 active
- Click "Next" without filling in fields — Zod validation errors appear inline
- Fill step 0 → "Next" → step 1 appears with slide animation and stepper advances
- Fill step 1 → "Next" → Review step shows a correct summary of both steps
- Click "Create" → loading spinner → Done screen appears with correct user name
- "Add Another" resets all fields and returns to step 0
- "View Records" navigates to the entity list page
- Record appears at the top of the list on the CRUD page
