<script setup lang="ts">
import type { KanbanPriority } from '~/types/kanban'

definePageMeta({ title: 'Kanban', isTable: true })

const store = useKanbanStore()
const { log } = useActivityLog()



// ── Priority config ───────────────────────────────────────────────────────
type BadgeColor = 'neutral' | 'warning' | 'error' | 'info' | 'success' | 'primary' | 'secondary'

const priorityConfig: Record<KanbanPriority, { color: BadgeColor; icon: string; label: string }> = {
    low: { color: 'neutral', icon: 'i-lucide-arrow-down', label: 'Low' },
    medium: { color: 'warning', icon: 'i-lucide-minus', label: 'Medium' },
    high: { color: 'error', icon: 'i-lucide-arrow-up', label: 'High' },
    critical: { color: 'error', icon: 'i-lucide-flame', label: 'Critical' },
}

// ── Drag state ────────────────────────────────────────────────────────────
const dragging = ref<{ cardId: string; fromColumnId: string } | null>(null)

/**
 * Tracks WHERE the drag cursor currently is:
 * - cardId: insert BEFORE this card
 * - cardId null: drop at the END of the column
 */
const dragOver = ref<{ columnId: string; cardId: string | null } | null>(null)

const isDraggingCard = (cardId: string) => dragging.value?.cardId === cardId
const isColumnOver = (columnId: string) => dragOver.value?.columnId === columnId
const isCardOver = (cardId: string) => dragOver.value?.cardId === cardId

// ── Drag handlers ─────────────────────────────────────────────────────────
const onCardDragStart = (e: DragEvent, cardId: string, columnId: string, locked: boolean) => {
    if (locked) {
        e.preventDefault()
        return
    }
    dragging.value = { cardId, fromColumnId: columnId }
    e.dataTransfer!.effectAllowed = 'move'
}

const onCardDragOver = (cardId: string, columnId: string) => {
    if (!dragging.value) return
    dragOver.value = { columnId, cardId }
}

const onColumnDragOver = (columnId: string) => {
    if (!dragging.value) return
    // Only set column-level target if not currently over a card
    if (dragOver.value?.cardId !== null) return
    dragOver.value = { columnId, cardId: null }
}

const onDrop = (toColumnId: string, insertBeforeCardId?: string) => {
    if (!dragging.value) return

    const { cardId, fromColumnId } = dragging.value

    // Resolve human-readable names for the log message
    const fromCol = store.columns.find(c => c.id === fromColumnId)
    const toCol = store.columns.find(c => c.id === toColumnId)
    const card = fromCol?.cards.find(c => c.id === cardId)

    store.moveCard(cardId, fromColumnId, toColumnId, insertBeforeCardId)

    if (card && fromCol && toCol) {
        if (fromColumnId === toColumnId) {
            log('Kanban', 'updated', `Reordered "${card.title}" within "${toCol.title}"`)
        } else {
            log('Kanban', 'updated', `Moved "${card.title}" from "${fromCol.title}" to "${toCol.title}"`)
        }
    }

    dragging.value = null
    dragOver.value = null
}

const onDragEnd = () => {
    dragging.value = null
    dragOver.value = null
}

// ── Add card ──────────────────────────────────────────────────────────────
const addingCard = ref<string | null>(null)  // columnId
const newCardTitle = ref('')
const newCardPriority = ref<KanbanPriority>('medium')

// Auto-focus the title input whenever the add-card form is shown.
// Uses a querySelector because the UInput is inside a v-for — useTemplateRef
// would return an array and the exposed property name is ambiguous.
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
    if (!addingCard.value || !newCardTitle.value.trim()) {
        cancelAddCard()
        return
    }
    const col = store.columns.find(c => c.id === addingCard.value)
    store.addCard(addingCard.value, {
        title: newCardTitle.value.trim(),
        priority: newCardPriority.value,
        tags: [],
        locked: false,
    })
    log('Kanban', 'created', `Added "${newCardTitle.value.trim()}" to "${col?.title ?? addingCard.value}"`)
    cancelAddCard()
}

const cancelAddCard = () => {
    addingCard.value = null
    newCardTitle.value = ''
}

const priorityOptions: { value: KanbanPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
]
</script>

<template>
    <PageHeading forTable title="Kanban" description="Drag cards between columns to track progress">
        <div class="flex items-center gap-2 text-xs text-muted">
            <UIcon name="i-lucide-lock" class="size-3.5" />
            <span>{{ store.lockedCount }} locked</span>
            <span class="text-default/20">·</span>
            <span>{{ store.totalCards }} total</span>
        </div>
    </PageHeading>

    <!-- ── Board ── -->
    <div class="flex-1 min-h-0 flex flex-col">
        <div class="flex-1 flex gap-3 overflow-x-auto scrollbar p-4">

            <div v-for="column in store.columns" :key="column.id" class="flex flex-col w-72 shrink-0 gap-2">
                <!-- Column header -->
                <div class="flex items-center gap-2 p-2 rounded-xl shrink-0">
                    <span class="size-2.5 rounded-full shrink-0" :class="column.dotColor" />
                    <UIcon :name="column.icon" class="size-4 text-muted shrink-0" />
                    <span class="text-sm font-semibold truncate">{{ column.title }}</span>
                    <UBadge :label="String(column.cards.length)" variant="soft" color="neutral"
                        class="ml-auto shrink-0 font-mono" />
                </div>

                <!-- Drop zone -->
                <div class="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar rounded-xl p-2 transition-all duration-150"
                    :class="isColumnOver(column.id)
                        ? 'bg-primary/5 ring-2 ring-primary/30 ring-dashed'
                        : 'bg-elevated/40'" @dragover.prevent="onColumnDragOver(column.id)"
                    @drop.prevent="onDrop(column.id)" @dragend="onDragEnd">
                    <template v-for="card in column.cards" :key="card.id">
                        <!-- Drop-before indicator -->
                        <div v-if="isCardOver(card.id)" class="h-0.5 rounded-full bg-primary mx-1 shrink-0" />

                        <!-- Card -->
                        <UCard :ui="{ body: 'sm:p-4 relative space-y-2' }" class="group transition-all select-none"
                            :class="[
                                card.locked
                                    ? 'cursor-default opacity-80'
                                    : 'cursor-grab active:cursor-grabbing hover:ring-primary/30 hover:shadow-sm',
                                isDraggingCard(card.id) && 'opacity-40 scale-95',
                            ]" :draggable="!card.locked"
                            @dragstart="onCardDragStart($event, card.id, column.id, card.locked)"
                            @dragover.prevent="onCardDragOver(card.id, column.id)"
                            @drop.prevent.stop="onDrop(column.id, card.id)" @dragend="onDragEnd">
                            <!-- Lock badge (top-right) -->
                            <div v-if="card.locked" class="absolute top-2.5 right-2.5 text-muted"
                                title="This card is locked and cannot be moved">
                                <UIcon name="i-lucide-lock" class="size-3" />
                            </div>

                            <!-- Title -->
                            <p class="text-sm font-medium leading-snug pr-4"
                                :class="card.locked ? 'text-muted' : 'text-highlighted'">
                                {{ card.title }}
                            </p>

                            <!-- Description -->
                            <p v-if="card.description" class="text-xs text-muted leading-relaxed line-clamp-2">
                                {{ card.description }}
                            </p>

                            <!-- Footer: priority + tags -->
                            <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <UBadge :label="priorityConfig[card.priority].label"
                                    :icon="priorityConfig[card.priority].icon"
                                    :color="priorityConfig[card.priority].color" variant="subtle" size="sm" />
                                <UBadge v-for="tag in card.tags" :key="tag" :label="tag" color="neutral" variant="soft"
                                    size="sm" />
                            </div>
                        </UCard>
                    </template>

                    <!-- Inline add-card form -->
                    <div v-if="addingCard === column.id"
                        class="bg-default rounded-lg border border-primary/50 p-3 space-y-2 shrink-0">
                        <UInput ref="addCardInput" v-model="newCardTitle" placeholder="Card title…" size="sm"
                            class="w-full kanban-add-card-input" @keyup.enter="confirmAddCard"
                            @keyup.esc="cancelAddCard" />
                        <div class="flex items-center gap-2">
                            <USelect v-model="newCardPriority" :items="priorityOptions" size="xs" class="flex-1" />
                            <UButton label="Add" size="xs" @click="confirmAddCard" />
                            <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost"
                                @click="cancelAddCard" />
                        </div>
                    </div>

                    <!-- Empty column state -->
                    <UEmpty v-if="column.cards.length === 0 && addingCard !== column.id" variant="naked"
                        icon="i-lucide-inbox" title="No cards" description="Drop a card here or add one below"
                        class="flex-1 py-4" />
                </div>

                <!-- Add card trigger -->
                <UButton v-if="addingCard !== column.id" label="Add Card" icon="i-lucide-plus" size="xs" color="neutral"
                    variant="ghost" class="shrink-0 justify-start" @click="startAddCard(column.id)" />
            </div>

        </div>
    </div>
</template>
