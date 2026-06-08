# Skill: Add an Entity Type

## Purpose
Create a TypeScript interface for a new entity in `app/types/` and re-export it through `app/utils/seeder.ts` so stores can import type and seeder from a single source.

## When to Use
- Introducing a brand new data model to the app
- A store or seeder needs a typed interface that doesn't exist yet

## Prerequisites
- You know the field names and their types for the new entity
- `app/types/` directory exists
- `app/utils/seeder.ts` exists

## Steps

1. **Create** `app/types/<entity>.ts` with a single named export:
   ```ts
   export interface <Entity> {
     id: string
     // ... other fields
   }
   ```

2. **Field type guide**:

   | Kind of data            | TypeScript type  | Notes                                      |
   |-------------------------|------------------|--------------------------------------------|
   | Identifier              | `string`         | Always `string`, generated with `faker.string.uuid()` |
   | Text / label / name     | `string`         |                                            |
   | Number / price / count  | `number`         |                                            |
   | Date                    | `string`         | Store as ISO date string `'YYYY-MM-DD'`    |
   | Boolean flag            | `boolean`        |                                            |
   | Enum / status           | Union type       | e.g., `'active' \| 'inactive' \| 'pending'` |
   | Optional field          | `field?: Type`   | Use `?` for truly optional fields          |

3. **Export the type from `app/utils/seeder.ts`** so stores can import in one place:
   ```ts
   // At the top of seeder.ts, alongside other type re-exports:
   export type { <Entity> } from '../types/<entity>'
   ```
   Also add the import inside seeder.ts if you need to use it in a generator:
   ```ts
   import type { <Entity> } from '../types/<entity>'
   ```

## Conventions
- Every entity **must** have `id: string` as its first field
- Keep interfaces flat — avoid nested objects unless truly necessary
- Use union string literal types for status/category enums (not TypeScript `enum`)
- Do not add `readonly` modifiers — stores mutate these objects in place
- Type file must only contain the interface — no logic, no imports beyond what TypeScript needs
- Filename must be lowercase and match the entity name: `product.ts` for `Product`

## Output / Deliverables
- `app/types/<entity>.ts` — new TypeScript interface file
- `app/utils/seeder.ts` — updated with `export type { <Entity> }` re-export

## Verification
- `pnpm typecheck` passes with no errors
- Confirm the type is importable: `import type { <Entity> } from '~/utils/seeder'` in any store
