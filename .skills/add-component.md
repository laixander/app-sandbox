# Skill: Add a Shared Component

## Purpose
Create a reusable Vue component in `app/components/`, following the project's established conventions — TypeScript props interface, `withDefaults`, `defineModel` for two-way bindings, `defineEmits` for events, no business logic.

## When to Use
- A UI pattern is repeated across 2+ pages or components
- A piece of UI needs to be isolated for clarity (e.g., a complex card, a styled badge, a form section)
- You are creating a new primitive wrapper around a Nuxt UI component

## Prerequisites
- The component's visual design and prop API are clear
- `app/components/` directory exists
- Nuxt UI is available (`UCard`, `UBadge`, `UButton`, `UIcon`, etc.)

## Steps

1. **Create** `app/components/<ComponentName>.vue`
   - Use PascalCase for the filename: `MyWidget.vue`
   - Nuxt auto-imports all files in `app/components/` — no manual registration needed

2. **Write the `<script setup lang="ts">` block** using this structure:

   **Props only** (most common — e.g., `StatCard`, `PageHeading`):
   ```ts
   <script setup lang="ts">
   import { computed } from 'vue'   // only if computed/watch is needed

   interface Props {
       title: string
       description?: string        // use ? for optional fields
       icon?: string
       value?: string | number
   }

   const props = withDefaults(defineProps<Props>(), {
       description: '',
       icon: 'i-lucide-circle'
   })
   </script>
   ```

   **With emits** (e.g., action components, form wrappers):
   ```ts
   <script setup lang="ts">
   interface Props {
       label: string
       disabled?: boolean
   }

   withDefaults(defineProps<Props>(), {
       disabled: false
   })

   const emit = defineEmits<{
       (e: 'confirm'): void
       (e: 'cancel'): void
   }>()
   </script>
   ```

   **With `defineModel`** (two-way binding — e.g., `TableGlobalFilter`, `ConfirmationModal`):
   ```ts
   <script setup lang="ts">
   // For a simple value binding (string, boolean, etc.)
   const modelValue = defineModel<string>({ default: '' })

   // For a named model (like v-model:open)
   const isOpen = defineModel<boolean>('open', { default: false })
   </script>
   ```

3. **Add a section comment header** for complex components:
   ```ts
   <script setup lang="ts">
   // ============================================================================
   // Component: <ComponentName>
   // ============================================================================
   // One-line description of what this component renders.
   ```

4. **Write the `<template>`**:
   - Keep templates declarative — no complex logic inline; use computed properties in `<script>`
   - Use Nuxt UI primitives (`UCard`, `UBadge`, `UButton`, `UIcon`) as building blocks
   - Use `variant="subtle"` on `UCard` for consistency with the rest of the app
   - Use Lucide icons (`i-lucide-*`) — not Heroicons
   - Expose named slots for customization when the component needs to be extensible:
     ```html
     <slot name="action" />        <!-- optional action slot -->
     <slot />                      <!-- default slot -->
     ```
   - Guard optional slot rendering with `v-if="$slots.<slotName>"`:
     ```html
     <div v-if="$slots.action" class="mt-8">
         <slot name="action" />
     </div>
     ```

5. **Component patterns by type**:

   **Display card** (like `StatCard`):
   ```html
   <template>
       <UCard :ui="{ body: 'px-4 py-5 sm:p-6' }" variant="subtle" class="shadow-sm">
           <div class="flex items-center justify-between">
               <div class="text-sm font-medium">{{ title }}</div>
               <UIcon v-if="icon" :name="icon" class="text-primary w-5 h-5 opacity-50" />
           </div>
           <div class="text-3xl font-bold mt-2">{{ value }}</div>
       </UCard>
   </template>
   ```

   **Modal wrapper** (like `ConfirmationModal`):
   ```html
   <template>
       <UModal v-model:open="isOpen" :ui="{ content: 'w-full sm:max-w-sm' }">
           <template #content="{ close }">
               <div class="flex flex-col gap-8 p-4 sm:p-6">
                   <!-- content -->
               </div>
               <UButton icon="i-lucide-x" color="neutral" variant="ghost"
                   class="absolute top-2 right-2" @click="close" />
           </template>
       </UModal>
   </template>
   ```

   **Layout helper** (like `PageHeading`):
   ```html
   <template>
       <div class="flex items-center justify-between" :class="forTable ? 'p-4 border-b border-default' : ''">
           <div class="flex-1">
               <div class="text-2xl font-bold">
                   <slot name="title">{{ title }}</slot>
               </div>
               <div class="text-sm text-muted" v-if="description">{{ description }}</div>
           </div>
           <slot />
       </div>
   </template>
   ```

   **Status/badge display** (like `StatusBadge`):
   ```ts
   // Use a colorMap Record<string, BadgeColor> for type-safe badge coloring
   type BadgeColor = 'success' | 'info' | 'error' | 'neutral' | 'primary' | 'secondary' | 'warning'

   const colorMap: Record<string, BadgeColor> = {
       'Active': 'success',
       'Inactive': 'error',
       'default': 'neutral'
   }

   const badgeColor = computed(() => colorMap[props.status] || colorMap['default'])
   ```

## Conventions
- **No business logic** in shared components — no store calls, no route navigation, no API calls
- **No hardcoded data** — all content comes from props or slots
- Use `withDefaults(defineProps<Props>(), {...})` — never use `defineProps` without defaults for optional fields
- Use `defineModel` for two-way bindings instead of `modelValue` prop + `update:modelValue` emit
- Always use Lucide icons (`i-lucide-*`)
- `UCard` with `variant="subtle"` and `class="shadow-sm"` is the standard card style
- Wrap optional slot content in `v-if="$slots.<name>"` so the container div doesn't render when unused
- Do NOT add `class` to the root element for styling that should be the consumer's responsibility — expose `class` as a prop if needed

## Output / Deliverables
- `app/components/<ComponentName>.vue` — new auto-imported shared component

## Verification
- `pnpm typecheck` passes with no errors
- Use the component in `app/pages/index.vue` temporarily without any import statement
- Verify all props render correctly
- Verify slots work when provided and are absent when not
- Verify `defineModel` two-way binding updates the parent ref
