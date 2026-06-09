# Skill: Add a Kanban Board Page

## Purpose
Scaffold a drag-and-drop Kanban board with multiple columns, draggable cards, locked (non-draggable) cards, an inline add-card form, and cross-column + intra-column reordering — following the exact structure of `app/pages/kanban.vue`.

## When to Use
- You need a visual task/workflow board where items progress through stages
- Cards need to be moveable between columns via drag and drop
- Some cards must be pinned/locked and cannot be moved

## Key Files
| File | Role |
|---|---|
| `app/types/kanban.ts` | `KanbanPriority`, `KanbanCard`, `KanbanColumn` types |
| `app/stores/kanbanStore.ts` | `moveCard`, `addCard`, `deployMockData`, `removeMockData` |
| `app/pages/kanban.vue` | The board page |

---

## Steps

### 1. Define types (`app/types/kanban.ts`)
```ts
export type KanbanPriority = 'low' | 'medium' | 'high' | 'critical'

export interface KanbanCard {
    id: string
    title: string
    description?: string
    priority: KanbanPriority
    tags: string[]
    /** If true, the card cannot be dragged */
    locked: boolean
    createdAt: string
}

export interface KanbanColumn {
    id: string
    title: string
    icon: string
    dotColor: string    // Tailwind class e.g. 'bg-blue-500'
    cards: KanbanCard[]
}
```

### 2. Create the store (`app/stores/kanbanStore.ts`)
```ts
// Column structure is ALWAYS present (even after reset).
// Cards are what get seeded / cleared — columns are never destroyed.
function createColumnStructure(): KanbanColumn[] {
    return [
        { id: 'backlog',     title: 'Backlog',     icon: 'i-lucide-inbox',            dotColor: 'bg-neutral-400', cards: [] },
        { id: 'todo',        title: 'To Do',        icon: 'i-lucide-circle-dashed',    dotColor: 'bg-blue-500',    cards: [] },
        { id: 'in-progress', title: 'In Progress',  icon: 'i-lucide-timer',            dotColor: 'bg-amber-500',   cards: [] },
        { id: 'review',      title: 'Review',       icon: 'i-lucide-eye',              dotColor: 'bg-violet-500',  cards: [] },
        { id: 'done',        title: 'Done',         icon: 'i-lucide-circle-check-big', dotColor: 'bg-green-500',   cards: [] },
    ]
}

export const useKanbanStore = defineStore('kanbanStore', {
    state: () => ({
        // Columns always exist — cards are what get seeded / cleared
        columns: createColumnStructure() as KanbanColumn[],
    }),

    actions: {
        moveCard(cardId: string, fromColumnId: string, toColumnId: string, insertBeforeCardId?: string) {
            const fromCol = this.columns.find(c => c.id === fromColumnId)
            const toCol   = this.columns.find(c => c.id === toColumnId)
            if (!fromCol || !toCol) return

            const cardIdx = fromCol.cards.findIndex(c => c.id === cardId)
            if (cardIdx === -1) return

            const [card] = fromCol.cards.splice(cardIdx, 1)
            if (!card) return   // splice returns T[] — guard required so TS narrows T | undefined → T

            if (insertBeforeCardId) {
                const targetIdx = toCol.cards.findIndex(c => c.id === insertBeforeCardId)
                toCol.cards.splice(targetIdx === -1 ? toCol.cards.length : targetIdx, 0, card)
            } else {
                toCol.cards.push(card)
            }
        },

        addCard(columnId: string, data: Omit<KanbanCard, 'id' | 'createdAt'>) {
            const col = this.columns.find(c => c.id === columnId)
            if (!col) return
            col.cards.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data })
        },

        deployMockData() { this.columns = createInitialColumns() },

        removeMockData() {
            // Keep column structure — only clear cards so UEmpty state shows per column
            this.columns.forEach(col => { col.cards = [] })
        },
    },

    getters: {
        // Columns always exist, so hasData = there are cards, not there are columns
        hasData:     (state) => state.columns.some(col => col.cards.length > 0),
        totalCards:  (state) => state.columns.reduce((sum, col) => sum + col.cards.length, 0),
        lockedCount: (state) => state.columns.reduce((sum, col) => sum + col.cards.filter(c => c.locked).length, 0),
    },

    persist: { storage: persistedState.localStorage },
})
```

> Use a `makeCard(title, opts)` factory helper inside the store file to reduce seeder boilerplate.

### 3. Create the page (`app/pages/kanban.vue`)

**`definePageMeta`:**
```ts
definePageMeta({ title: 'Kanban', isTable: true })
// isTable: true gives the full-height flex layout needed for the board
```

> **Do NOT auto-seed on `onMounted`.** The store starts empty, like all other stores. Data is only populated via DemoFab "Deploy Demo Data". Auto-seeding on mount will re-populate the board after a system reset — undoing it silently.

**Type the badge color config explicitly** — TypeScript widens object literal `color` fields to `string`, which fails UBadge's prop type:
```ts
type BadgeColor = 'neutral' | 'warning' | 'error' | 'info' | 'success' | 'primary' | 'secondary'

const priorityConfig: Record<KanbanPriority, { color: BadgeColor; icon: string; label: string }> = {
    low:      { color: 'neutral', icon: 'i-lucide-arrow-down', label: 'Low' },
    medium:   { color: 'warning', icon: 'i-lucide-minus',      label: 'Medium' },
    high:     { color: 'error',   icon: 'i-lucide-arrow-up',   label: 'High' },
    critical: { color: 'error',   icon: 'i-lucide-flame',      label: 'Critical' },
}
```

**Drag state:**
```ts
const dragging = ref<{ cardId: string; fromColumnId: string } | null>(null)
// columnId: the column being dragged over
// cardId: insert BEFORE this card; null = append to end
const dragOver = ref<{ columnId: string; cardId: string | null } | null>(null)
```

**Drag handlers:**
```ts
const onCardDragStart = (e: DragEvent, cardId: string, columnId: string, locked: boolean) => {
    if (locked) { e.preventDefault(); return }
    dragging.value = { cardId, fromColumnId: columnId }
    e.dataTransfer!.effectAllowed = 'move'
}

const onCardDragOver = (cardId: string, columnId: string) => {
    if (!dragging.value) return
    dragOver.value = { columnId, cardId }
}

const onColumnDragOver = (columnId: string) => {
    if (!dragging.value) return
    if (dragOver.value?.cardId !== null) return   // don't override card-over
    dragOver.value = { columnId, cardId: null }
}

const onDrop = (toColumnId: string, insertBeforeCardId?: string) => {
    if (!dragging.value) return
    store.moveCard(dragging.value.cardId, dragging.value.fromColumnId, toColumnId, insertBeforeCardId)
    dragging.value = null
    dragOver.value = null
}

const onDragEnd = () => { dragging.value = null; dragOver.value = null }
```

**Inline add-card form:**
```ts
const addingCard = ref<string | null>(null)  // column ID currently being added to
const newCardTitle = ref('')
const newCardPriority = ref<KanbanPriority>('medium')

// IMPORTANT: Do NOT use useTemplateRef for the input inside a v-for.
// Vue collects refs inside v-for into arrays, causing type errors.
// Use a watch + querySelector instead:
watch(addingCard, async (val) => {
    if (!val) return
    await nextTick()
    document.querySelector<HTMLInputElement>('.kanban-add-card-input input')?.focus()
})

const startAddCard = (columnId: string) => {
    addingCard.value = columnId
    newCardTitle.value = ''
    newCardPriority.value = 'medium'
}

const confirmAddCard = () => {
    if (!addingCard.value || !newCardTitle.value.trim()) { cancelAddCard(); return }
    store.addCard(addingCard.value, { title: newCardTitle.value.trim(), priority: newCardPriority.value, tags: [], locked: false })
    cancelAddCard()
}

const cancelAddCard = () => { addingCard.value = null; newCardTitle.value = '' }
```


### 4. Template structure
```html
<PageHeading title="Kanban" description="...">
    <!-- optional stats in slot -->
</PageHeading>

<!-- Board container: full height, horizontal scroll -->
<div class="flex-1 overflow-hidden">
    <div class="flex gap-3 h-full overflow-x-auto scrollbar p-4 items-start">

        <div v-for="column in store.columns" :key="column.id" class="flex flex-col w-72 shrink-0 h-full gap-2">
            <!-- Column header -->
            <div class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-elevated shrink-0">
                <span class="size-2.5 rounded-full" :class="column.dotColor" />
                <UIcon :name="column.icon" class="size-3.5 text-muted" />
                <span class="text-sm font-semibold">{{ column.title }}</span>
                <UBadge :label="String(column.cards.length)" variant="soft" color="neutral" size="xs" class="ml-auto font-mono" />
            </div>

            <!-- Drop zone -->
            <div
                class="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar rounded-xl p-2 transition-all"
                :class="isColumnOver(column.id) ? 'bg-primary/5 ring-2 ring-primary/30 ring-dashed' : 'bg-elevated/40'"
                @dragover.prevent="onColumnDragOver(column.id)"
                @drop.prevent="onDrop(column.id)"
                @dragend="onDragEnd"
            >
                <template v-for="card in column.cards" :key="card.id">
                    <!-- Drop-before indicator line -->
                    <div v-if="isCardOver(card.id)" class="h-0.5 rounded-full bg-primary mx-1 shrink-0" />

                    <!-- Card -->
                    <div
                        class="group relative bg-default rounded-lg border border-default p-3 space-y-2 transition-all select-none"
                        :class="[
                            card.locked ? 'cursor-default opacity-80' : 'cursor-grab hover:border-primary/30',
                            isDraggingCard(card.id) && 'opacity-40 scale-95',
                        ]"
                        :draggable="!card.locked"
                        @dragstart="onCardDragStart($event, card.id, column.id, card.locked)"
                        @dragover.prevent="onCardDragOver(card.id, column.id)"
                        @drop.prevent.stop="onDrop(column.id, card.id)"
                        @dragend="onDragEnd"
                    >
                        <!-- Lock icon -->
                        <div v-if="card.locked" class="absolute top-2.5 right-2.5 text-muted">
                            <UIcon name="i-lucide-lock" class="size-3" />
                        </div>

                        <p class="text-sm font-medium leading-snug pr-4">{{ card.title }}</p>
                        <p v-if="card.description" class="text-xs text-muted line-clamp-2">{{ card.description }}</p>

                        <div class="flex items-center gap-1.5 flex-wrap">
                            <UBadge :label="priorityConfig[card.priority].label" :icon="priorityConfig[card.priority].icon"
                                :color="priorityConfig[card.priority].color" variant="subtle" size="xs" />
                            <UBadge v-for="tag in card.tags" :key="tag" :label="tag" color="neutral" variant="soft" size="xs" />
                        </div>
                    </div>
                </template>

                <!-- Inline add-card form -->
                <div v-if="addingCard === column.id" class="bg-default rounded-lg border border-primary/50 p-3 space-y-2 shrink-0">
                    <UInput v-model="newCardTitle" placeholder="Card title…" size="sm" class="w-full kanban-add-card-input"
                        @keyup.enter="confirmAddCard" @keyup.esc="cancelAddCard" />
                    <div class="flex items-center gap-2">
                        <USelect v-model="newCardPriority" :items="priorityOptions" size="xs" class="flex-1" />
                        <UButton label="Add" size="xs" @click="confirmAddCard" />
                        <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" @click="cancelAddCard" />
                    </div>
                </div>

                <!-- Empty column state -->
                <UEmpty
                    v-if="column.cards.length === 0 && addingCard !== column.id"
                    variant="naked"
                    icon="i-lucide-inbox"
                    title="No cards"
                    description="Drop a card here or add one below"
                    class="flex-1 py-4"
                />
            </div>

            <!-- Add card trigger -->
            <UButton v-if="addingCard !== column.id" label="Add Card" icon="i-lucide-plus"
                size="xs" color="neutral" variant="ghost" class="shrink-0 justify-start" @click="startAddCard(column.id)" />
        </div>
    </div>
</div>
```

### 5. Wire into sidebar (`app/layouts/default.vue`)
```ts
{ label: 'Kanban', icon: 'i-lucide-kanban', to: '/kanban' }
```

### 6. Wire into DemoFab (`app/components/DemoFab.vue`)
```ts
import { useKanbanStore } from '~/stores/kanbanStore'
const kanbanStore = useKanbanStore()

// Add to isDataDeployed:
|| kanbanStore.hasData

// Add to handleSeed:
kanbanStore.deployMockData()

// Add to handleReset:
kanbanStore.removeMockData()
```

---

## Conventions

- **`isTable: true`** in `definePageMeta` — required for the full-height layout the board needs
- **`locked: boolean`** on each card — set `draggable="false"` in the template and display `i-lucide-lock`; use `cursor-default opacity-80`
- **`dragOver.cardId`** — `null` means "append to end of column"; a card ID means "insert before this card"
- **Drop-before indicator** — `<div class="h-0.5 rounded-full bg-primary">` rendered ABOVE the target card via `v-if="isCardOver(card.id)"`
- **Column drop zone highlight** — `ring-2 ring-primary/30 ring-dashed bg-primary/5` applied when `isColumnOver(columnId)`
- **`@drop.prevent.stop` on cards** — `.stop` prevents the event from bubbling to the column `@drop`, so each drop fires only once
- **Never use `useTemplateRef` for elements inside `v-for`** — Vue collects them into an array; use `watch` + `querySelector` with a marker class instead
- **`type BadgeColor = ...`** — always type explicit color union configs; TypeScript widens object literals to `string`, which fails component prop types
- **Do NOT auto-seed on `onMounted`** — the store starts empty like all other stores; seeding is exclusively via DemoFab
- **`UEmpty` in empty columns** — `<UEmpty variant="naked" class="flex-1 py-4">` inside the drop zone when `column.cards.length === 0 && addingCard !== column.id`; keeps the column visible and still droppable
- **`splice` guard** — `const [card] = arr.splice(idx, 1); if (!card) return` is required; TypeScript types `splice` as returning `T[]` so the destructured element is `T | undefined`
- **`crypto.randomUUID()`** — standard for generating IDs

---

## Output / Deliverables
- `app/types/kanban.ts`
- `app/stores/kanbanStore.ts`
- `app/pages/kanban.vue`
- `app/layouts/default.vue` — sidebar nav item
- `app/components/DemoFab.vue` — store wired in

## Verification
- Navigate to `/kanban` — 5 empty columns show with `UEmpty` state; no cards until DemoFab seeds
- Click DemoFab "Deploy Demo Data" — 13 cards populate across columns; 4 show the lock icon
- Drag a draggable card to another column — it moves; board state persists after page reload
- Drag a locked card — cursor does not change to grab; card does not move
- Drag a card over another card in the same column — thin blue line appears above target; release reorders
- Drag over an empty column area — column highlights with dashed ring; release appends to end
- Click "Add Card" on any column — inline form appears, input is focused automatically
- Type a title, press Enter — card appears at the top of the column; form closes
- Press Esc — form closes without adding a card
- DemoFab "Reset" — all cards cleared; 5 columns remain with UEmpty state; "Deploy Demo Data" restores cards
