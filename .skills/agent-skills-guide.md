# Agent Skills — Setup & Usage Guide

Agent Skills let you package a repeatable workflow into a reusable set of instructions for an AI agent. Instead of rewriting long prompts and re-explaining project conventions each time, a skill gives the agent a stable sequence of steps to follow — improving consistency across runs.

Skills are plain **Markdown files** stored in your project. When you reference one, the agent reads and executes it as structured instructions.

---

## Why Use Skills?

| Without Skills | With Skills |
|---|---|
| Re-explain conventions every session | Agent reads them automatically from the file |
| Instructions drift or get forgotten | Steps are version-controlled and stable |
| Inconsistent output across runs | Predictable, repeatable results |
| Long prompts repeated manually | One-line invocation: *"Use skill: add-entity"* |

---

## Directory Structure

Store skills in a `.skills/` folder at your project root:

```
app-sandbox/
├── .skills/
│   ├── agent-skills-guide.md    ← This file (developer reference)
│   ├── add-entity.md            ← Full scaffold: type → seeder → store → page
│   ├── add-type.md              ← Add a TypeScript interface
│   ├── add-seeder-entity.md     ← Extend the seeder with a new entity
│   ├── add-store.md             ← Scaffold a Pinia store
│   ├── add-crud-page.md         ← Scaffold a full CRUD page
│   ├── add-dashboard-page.md    ← Scaffold a StatCard overview/summary page
│   ├── add-component.md         ← Create a shared Vue component
│   └── add-composable.md        ← Create an auto-imported composable
├── app/
├── nuxt.config.ts
└── README.md
```

> The `.skills/` folder is not processed by Nuxt — it's purely for agent and developer consumption.

---

## Skill File Specification

Each skill is a Markdown file with the following structure:

```markdown
# Skill: [Name]

## Purpose
One-sentence description of what this skill accomplishes.

## When to Use
Bullet list of scenarios where this skill applies.

## Prerequisites
Any files, stores, or types that must already exist before running this skill.

## Steps
Numbered, precise, step-by-step instructions the agent must follow in order.

## Conventions
Rules and patterns specific to this project that the agent must respect.

## Output / Deliverables
What the agent should produce when this skill completes successfully.

## Verification
How to confirm the skill ran correctly (e.g., run typecheck, check browser).
```

---

## Project Architecture (Current State)

Understanding these patterns is critical for writing accurate skills.

### Layout System (`app/layouts/default.vue`)
- Uses **`USidebar`** with `UNavigationMenu` for navigation
- **`UserMenu`** component in the sidebar footer (theme switcher + logout)
- A `#header-actions-teleport` div in the header for page-specific action buttons
- Content area applies `flex flex-col overflow-hidden min-h-0` when `route.meta.isTable === true`
- **`DemoFab`** floating button for seeding/resetting data (bottom-right corner)

### Page Convention
- **`definePageMeta({ title: '...', isTable: true })`** must be the first statement in `<script setup>`
- `isTable: true` activates the full-height flex layout for tables/card grids
- **`PageHeading`** component replaces raw `<header>` — use with `forTable` prop for table pages
- Nav items are registered in `default.vue`'s `items` array

### Shared Components
| Component | Usage |
|---|---|
| `PageHeading` | Page header with title, description, and an action slot. Use `forTable` prop for table pages |
| `Empty` | Empty + loading state. Used inside `UTable`'s `#empty` slot and as card view fallback |
| `ConfirmationModal` | Confirmation dialog for destructive/important actions. Use `v-model:open`, `@confirm`, `confirmColor` |
| `TableGlobalFilter` | Search input (`v-model` string). Always shown in page header |
| `TableColumnToggle` | Column visibility dropdown. Only shown when `viewMode === 'list'` |
| `StatusBadge` | Colored badge for status/category values |
| `StatCard` | KPI summary card for dashboard use |
| `DemoFab` | Floating seeder/reset button — wired to the active entity store |
| `UserMenu` | Sidebar footer: theme color/neutral switcher + logout |

### Composables
| Composable | Usage |
|---|---|
| `useAppToast()` | Auto-imported. `toast.success(title, desc?)` and `toast.error(title, desc?)` |

### CSS Utilities
| Class | What it does |
|---|---|
| `.scrollbar` | Styled thin scrollbar (defined in `app/assets/css/main.css`) |
| `.squircle` | SVG mask for squircle-shaped images |

### Store Pattern (options API)
- `defineStore(id, { state, actions, getters, persist })`
- `isLoading` toggled around `setTimeout` calls
- New records always `unshift()` — never `push()`
- `persistedState.localStorage` for persistence (auto-imported global)

### Seeder Pattern
- `SeederService` plain object in `app/utils/seeder.ts`
- Per-entity triplet: `generateSingle<Entity>()`, `generate<Entity>s(count)`, `clear<Entity>s()`
- Types are imported and re-exported from `seeder.ts` so stores import from `~/utils/seeder`

### CRUD Page Pattern
- `viewMode` values: `'list'` | `'card'` (NOT `'table'`)
- `UDropdownMenu` with `[[Edit], [Delete]]` groups for row/card actions — no inline buttons
- `ConfirmationModal` required for delete AND for edit saves
- `filteredUsers` / `filtered<Entity>s` computed for card view search (table handles it natively)
- `columnVisibility` defaults to `{ id: false }`

---

## Skills in This Project

### `add-entity.md` — Full Entity Scaffold
Runs the entire pipeline in one shot: creates the type, extends the seeder, scaffolds the Pinia store, and builds the CRUD page. Use this when adding a brand new entity from scratch.

### `add-type.md` — TypeScript Interface
Creates `app/types/<entity>.ts` with a typed interface and re-exports it through `app/utils/seeder.ts` so stores have a single import source.

### `add-seeder-entity.md` — Seeder Extension
Adds `generateSingle<Entity>()`, `generate<Entity>s()`, and `clear<Entity>s()` methods to `SeederService` in `app/utils/seeder.ts`. Includes a faker method reference table.

### `add-store.md` — Pinia Store
Scaffolds `app/stores/<entity>Store.ts` with the options API style, `isLoading` flag, `deployMockData`/`removeMockData` actions, full CRUD actions, getters, and `localStorage` persistence.

### `add-crud-page.md` — CRUD Page
Builds the full `app/pages/<entity>.vue` with:
- `definePageMeta` with `isTable: true`
- `PageHeading` with `forTable`, `TableGlobalFilter`, `TableColumnToggle`, view toggle
- `UTable` with `<Empty>` slot, sticky, column visibility, global filter
- Card grid with `filtered<Entity>s` computed, `UDropdownMenu` actions
- `ConfirmationModal` for delete and edit confirmation
- `useAppToast()` for all notifications

### `add-dashboard-page.md` — Dashboard / Overview Page
Builds a non-table summary page with `StatCard` KPI grids and an optional recent-activity list. Does NOT use `isTable: true` — the layout applies standard scrollable padding automatically.

### `add-component.md` — Shared Component
Creates a new auto-imported Vue component in `app/components/` following the project's patterns: TypeScript `Props` interface, `withDefaults`, `defineModel` for two-way bindings, `defineEmits` for events, no business logic or store calls inside.

### `add-composable.md` — Composable
Creates a new auto-imported composable in `app/composables/` following the `useAppToast` pattern. Covers three patterns: wrapping a Nuxt built-in, reactive state + methods, and computed helpers over a store.

---

## How to Invoke a Skill

When you want the agent to follow a skill, simply reference it in your message:

```
"Use .skills/add-entity.md to scaffold a Products entity."
```

```
"Follow .skills/add-store.md to create a store for Orders."
```

```
"Use .skills/add-seeder-entity.md to add fake Task data to the seeder."
```

The agent will read the file with `IsSkillFile: true`, treating it as executable instructions rather than a file to summarize.

---

## Tips for Writing Effective Skills

- **Be numbered and sequential** — agents follow steps in order; ambiguity causes deviation
- **State conventions explicitly** — don't assume the agent remembers project patterns
- **Include a verification step** — gives the agent a clear success condition
- **Keep one skill per workflow** — don't combine unrelated steps into one file
- **Version control them** — skills are code; commit them alongside your source
- **Keep them current** — update skills whenever the codebase conventions change

---

## Quick Reference

| Skill File | What It Does |
|---|---|
| `add-entity.md` | Full scaffold: type → seeder → store → page |
| `add-type.md` | TypeScript interface in `app/types/` |
| `add-seeder-entity.md` | Extend `SeederService` with new entity generators |
| `add-store.md` | Pinia store with CRUD actions + localStorage persistence |
| `add-crud-page.md` | Full CRUD page: `PageHeading`, table, cards, modals, toasts |
| `add-dashboard-page.md` | Overview page with `StatCard` KPIs and recent-activity list |
| `add-component.md` | Shared Vue component with typed props, slots, and `defineModel` |
| `add-composable.md` | Auto-imported composable following `useAppToast` patterns |
