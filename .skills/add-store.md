# Skill: Add a Pinia Store

## Purpose
Scaffold a Pinia store for a given entity, following app-sandbox's options API style with localStorage persistence and simulated async actions.

## When to Use
- A new entity needs state management
- You have a TypeScript interface but no store yet

## Prerequisites
- The entity interface must exist in `app/types/<entity>.ts`
- `app/utils/seeder.ts` must have generator methods for the entity (`generateSingle<Entity>`, `generate<Entity>s`, `clear<Entity>s`)
- `@pinia-plugin-persistedstate/nuxt` is configured in `nuxt.config.ts`

## Steps

1. **Create** `app/stores/<entity>Store.ts`

2. **Import** the store factory and the entity type + seeder:
   ```ts
   import { defineStore } from 'pinia'
   import { SeederService, type <Entity> } from '~/utils/seeder'
   ```

3. **Define state** with the entity array and a loading flag:
   ```ts
   state: () => ({
     <entities>: [] as <Entity>[],
     isLoading: false,
   }),
   ```

4. **Define actions** — all async-simulated with `setTimeout`:
   - `deployMockData(count: number = 6)` — seeds via `SeederService.generate<Entity>s(count)`, delay 500ms
   - `removeMockData()` — clears via `SeederService.clear<Entity>s()`, delay 300ms
   - `create<Entity>(item: <Entity>)` — `unshift()` to prepend (no delay)
   - `update<Entity>(id: string, updatedData: Partial<<Entity>>)` — find by id, spread update (no delay)
   - `delete<Entity>(id: string)` — filter out by id (no delay)

   ```ts
   actions: {
     deployMockData(count: number = 6) {
       this.isLoading = true
       setTimeout(() => {
         this.<entities> = SeederService.generate<Entity>s(count)
         this.isLoading = false
       }, 500)
     },
     removeMockData() {
       this.isLoading = true
       setTimeout(() => {
         this.<entities> = SeederService.clear<Entity>s()
         this.isLoading = false
       }, 300)
     },
     create<Entity>(item: <Entity>) {
       this.<entities>.unshift(item)
     },
     update<Entity>(id: string, updatedData: Partial<<Entity>>) {
       const index = this.<entities>.findIndex(e => e.id === id)
       if (index !== -1) {
         this.<entities>[index] = { ...this.<entities>[index], ...updatedData } as <Entity>
       }
     },
     delete<Entity>(id: string) {
       this.<entities> = this.<entities>.filter(e => e.id !== id)
     }
   },
   ```

5. **Define getters**:
   ```ts
   getters: {
     <entity>Count: (state) => state.<entities>.length,
     has<Entity>s: (state) => state.<entities>.length > 0
   },
   ```

6. **Enable persistence**:
   ```ts
   persist: {
     storage: persistedState.localStorage
   }
   ```

## Full Store Template

```ts
import { defineStore } from 'pinia'
import { SeederService, type <Entity> } from '~/utils/seeder'

export const use<Entity>Store = defineStore('<entity>Store', {
  state: () => ({
    <entities>: [] as <Entity>[],
    isLoading: false,
  }),

  actions: {
    deployMockData(count: number = 6) {
      this.isLoading = true
      setTimeout(() => {
        this.<entities> = SeederService.generate<Entity>s(count)
        this.isLoading = false
      }, 500)
    },

    removeMockData() {
      this.isLoading = true
      setTimeout(() => {
        this.<entities> = SeederService.clear<Entity>s()
        this.isLoading = false
      }, 300)
    },

    create<Entity>(item: <Entity>) {
      this.<entities>.unshift(item)
    },

    update<Entity>(id: string, updatedData: Partial<<Entity>>) {
      const index = this.<entities>.findIndex(e => e.id === id)
      if (index !== -1) {
        this.<entities>[index] = { ...this.<entities>[index], ...updatedData } as <Entity>
      }
    },

    delete<Entity>(id: string) {
      this.<entities> = this.<entities>.filter(e => e.id !== id)
    }
  },

  getters: {
    <entity>Count: (state) => state.<entities>.length,
    has<Entity>s: (state) => state.<entities>.length > 0
  },

  persist: {
    storage: persistedState.localStorage
  }
})
```

## Conventions
- Use the **options API style** (`defineStore(id, { state, actions, getters, persist })`) — not the setup/composition style
- Store ID must be a camelCase string matching the filename: `'<entity>Store'`
- Always use `unshift()` for new records — not `push()`
- `isLoading` must be set to `true` **before** `setTimeout` and reset to `false` inside the callback
- Do NOT use `async/await` — use `setTimeout` to simulate network latency
- Do NOT destructure `persistedState` — use it as a global (it is auto-imported by the plugin)
- The entity type must be imported from `~/utils/seeder`, not directly from `~/types/<entity>`

## Output / Deliverables
- `app/stores/<entity>Store.ts` — fully functional Pinia store

## Verification
- `pnpm typecheck` passes with no errors
- The `DemoFab` component can use the store's `deployMockData()` and `removeMockData()` if wired up
- Confirm data populates and persists across page refreshes (localStorage)
