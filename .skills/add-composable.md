# Skill: Add a Composable

## Purpose
Create a new auto-imported composable in `app/composables/`, following the `useAppToast` pattern — a named export function that wraps Nuxt/Vue primitives into a clean, reusable interface.

## When to Use
- Encapsulating reusable logic that multiple pages or components need (e.g., form state, a shared timer, API wrapper, computed helpers)
- Wrapping a Nuxt built-in (`useToast`, `useRouter`, `useAppConfig`, etc.) with project-specific defaults
- Extracting business logic out of a page or component to keep it clean

## Prerequisites
- `app/composables/` directory exists
- The logic you're extracting is used in at least 2 places, or is complex enough to warrant isolation

## Steps

1. **Create** `app/composables/use<Name>.ts`

2. **Write a single named export function** — the filename must match the exported function name:
   ```ts
   // app/composables/useMyFeature.ts
   export const useMyFeature = () => {
       // ... logic
       return { ... }
   }
   ```
   > Nuxt auto-imports all files in `app/composables/` — no manual import needed in pages or components.

3. **Structure the composable** — pick the appropriate pattern:

   **Pattern A: Wrapping a Nuxt built-in** (like `useAppToast`):
   ```ts
   export const useAppToast = () => {
       const toast = useToast()   // Nuxt auto-imported

       return {
           success: (title: string, description?: string) => {
               toast.add({ title, description, color: 'primary', icon: 'i-lucide-check-circle' })
           },
           error: (title: string, description?: string) => {
               toast.add({ title, description, color: 'error', icon: 'i-lucide-x-circle' })
           }
       }
   }
   ```

   **Pattern B: Reactive state + methods**:
   ```ts
   export const useMyFeature = () => {
       const isLoading = ref(false)
       const data = ref<MyType | null>(null)

       const load = async () => {
           isLoading.value = true
           // ... logic
           isLoading.value = false
       }

       return { isLoading, data, load }
   }
   ```

   **Pattern C: Computed helpers over a store**:
   ```ts
   export const use<Entity>Helpers = () => {
       const store = use<Entity>Store()

       const sorted = computed(() =>
           [...store.<entities>].sort((a, b) => a.<field>.localeCompare(b.<field>))
       )

       return { sorted }
   }
   ```

4. **Add JSDoc comments** above each exported function and return value for IDE discoverability:
   ```ts
   /**
    * Provides application-wide toast notification helpers.
    */
   export const useAppToast = () => {
       const toast = useToast()

       return {
           /**
            * Display a success notification
            */
           success: (title: string, description?: string) => { ... },
           /**
            * Display an error notification
            */
           error: (title: string, description?: string) => { ... }
       }
   }
   ```

## Conventions
- Filename and export name must match exactly: `useMyFeature.ts` exports `useMyFeature`
- Always use `export const` — not `export default` or `export function`
- Composables are **stateless by default** — if you need global shared state, use Pinia instead
- Only import from Nuxt (`useToast`, `useRoute`, etc.) or Vue (`ref`, `computed`) inside the function body — not at the module top level
- Do NOT import components (`UButton`, etc.) in composables — components belong in `.vue` files
- If the composable only wraps a single built-in, keep it thin — don't add unnecessary abstraction
- Add a section comment header at the top for consistency:
  ```ts
  // ============================================================================
  // Composable: use<Name>
  // ============================================================================
  // One-line description of what this composable provides.
  ```

## Output / Deliverables
- `app/composables/use<Name>.ts` — new auto-imported composable

## Verification
- `pnpm typecheck` passes with no errors
- Use the composable in a page without any import statement — confirm it resolves automatically
- Call the returned methods/refs and verify expected behavior in the browser
