# Skill: Add a New Entity to the Seeder

## Purpose
Extend `app/utils/seeder.ts` with generator methods for a new entity and re-export its type so stores can import both from a single location.

## When to Use
- A new entity type has been created in `app/types/<entity>.ts`
- A store needs to call `SeederService.generate<Entity>s()` to seed mock data
- The entity needs reproducible, realistic fake data using `@faker-js/faker`

## Steps

1. **Open** `app/utils/seeder.ts`

2. **Import the new type** at the top of the file:
   ```ts
   import type { <Entity> } from '../types/<entity>'
   ```

3. **Re-export the type** so stores can import it from `~/utils/seeder` in one place:
   ```ts
   export type { <Entity> } from '../types/<entity>'
   ```

4. **Add three methods** to the `SeederService` object in this order:
   - `generateSingle<Entity>(): <Entity>` — returns one fake item
   - `generate<Entity>s(count: number = 5): <Entity>[]` — returns an array
   - `clear<Entity>s(): <Entity>[]` — returns an empty array

   ```ts
   generateSingleProduct(): Product {
     return {
       id: faker.string.uuid(),
       name: faker.commerce.productName(),
       price: parseFloat(faker.commerce.price()),
       category: faker.helpers.arrayElement(['Electronics', 'Clothing', 'Books'] as const),
       image: faker.image.url(),
     }
   },

   generateProducts(count: number = 5): Product[] {
     return Array.from({ length: count }, () => this.generateSingleProduct())
   },

   clearProducts(): Product[] {
     return []
   }
   ```

5. **Choose the right `faker` method** for each field type:

   | Field type       | Recommended faker method                                  |
   |------------------|-----------------------------------------------------------|
   | UUID / ID        | `faker.string.uuid()`                                     |
   | Full name        | `faker.person.fullName()`                                 |
   | Job title        | `faker.person.jobTitle()`                                 |
   | Email            | `faker.internet.email()`                                  |
   | Avatar image     | `faker.image.personPortrait()`                            |
   | Product name     | `faker.commerce.productName()`                            |
   | Price            | `parseFloat(faker.commerce.price())`                      |
   | URL / image      | `faker.image.url()`                                       |
   | Date (ISO)       | `faker.date.past().toISOString().split('T')[0]!`          |
   | Enum / status    | `faker.helpers.arrayElement([...] as const)`              |
   | Paragraph text   | `faker.lorem.paragraph()`                                 |
   | Company name     | `faker.company.name()`                                    |
   | Phone number     | `faker.phone.number()`                                    |
   | Number in range  | `faker.number.int({ min: 1, max: 100 })`                  |

## Conventions
- Always use `as const` on inline arrays passed to `faker.helpers.arrayElement()` — this preserves the literal union type
- Use `parseFloat(faker.commerce.price())` for monetary values — do not use `Number()` or leave as string
- Append `!` to date `.split('T')[0]` to satisfy the TypeScript strict non-null check
- `clearUsers()` / `clear<Entity>s()` must always return `[]` typed as `<Entity>[]` — never `undefined` or `null`
- `SeederService` is a plain object literal — do NOT convert it to a class
- New methods must be added **within** the existing `SeederService = { ... }` object, not outside it
- Keep the `generateSingle<Entity>`, `generate<Entity>s`, and `clear<Entity>s` triplet together for each entity

## Output / Deliverables
- `app/utils/seeder.ts` — updated with new import, re-export, and three new methods

## Verification
- `pnpm typecheck` passes with no errors
- In the browser console, confirm:
  ```js
  const { SeederService } = await import('/app/utils/seeder.ts')
  SeederService.generateProducts(3)
  ```
- Confirm output is an array of 3 well-formed objects
