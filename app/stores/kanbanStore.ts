import { defineStore } from 'pinia'
import type { KanbanCard, KanbanColumn } from '~/types/kanban'

// ── Seed data factory ─────────────────────────────────────────────────────
function makeCard(
    title: string,
    opts: Partial<Omit<KanbanCard, 'id' | 'title' | 'createdAt'>> & { daysAgo?: number } = {},
): KanbanCard {
    const { daysAgo = 0, ...rest } = opts
    return {
        id: crypto.randomUUID(),
        title,
        description: undefined,
        priority: 'medium',
        tags: [],
        locked: false,
        createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
        ...rest,
    }
}

// ── Column structure (always present, even after reset) ─────────────────
function createColumnStructure(): KanbanColumn[] {
    return [
        { id: 'backlog',     title: 'Backlog',     icon: 'i-lucide-inbox',            dotColor: 'bg-neutral-400', cards: [] },
        { id: 'todo',        title: 'To Do',        icon: 'i-lucide-circle-dashed',    dotColor: 'bg-blue-500',    cards: [] },
        { id: 'in-progress', title: 'In Progress',  icon: 'i-lucide-timer',            dotColor: 'bg-amber-500',   cards: [] },
        { id: 'review',      title: 'Review',       icon: 'i-lucide-eye',              dotColor: 'bg-violet-500',  cards: [] },
        { id: 'done',        title: 'Done',         icon: 'i-lucide-circle-check-big', dotColor: 'bg-green-500',   cards: [] },
    ]
}

function createInitialColumns(): KanbanColumn[] {
    return [
        {
            id: 'backlog',
            title: 'Backlog',
            icon: 'i-lucide-inbox',
            dotColor: 'bg-neutral-400',
            cards: [
                makeCard('Research competitor analysis', {
                    description: 'Review top 5 competitors and document key findings for Q4 strategy.',
                    priority: 'low',
                    tags: ['Research'],
                    daysAgo: 5,
                }),
                makeCard('Q4 Strategy Document', {
                    description: 'Locked: pending executive review before prioritization can begin.',
                    priority: 'high',
                    tags: ['Planning', 'Strategy'],
                    locked: true,
                    daysAgo: 3,
                }),
            ],
        },
        {
            id: 'todo',
            title: 'To Do',
            icon: 'i-lucide-circle-dashed',
            dotColor: 'bg-blue-500',
            cards: [
                makeCard('Set up CI/CD pipeline', {
                    description: 'Configure GitHub Actions for automated testing and deployment workflows.',
                    priority: 'high',
                    tags: ['DevOps'],
                    daysAgo: 4,
                }),
                makeCard('Update user documentation', {
                    description: 'Rewrite onboarding docs to reflect new UI changes in v2.',
                    priority: 'low',
                    tags: ['Docs'],
                    daysAgo: 2,
                }),
                makeCard('API rate limiting', {
                    description: 'Locked: compliance requirement — cannot be moved until legal sign-off.',
                    priority: 'critical',
                    tags: ['Backend', 'Security'],
                    locked: true,
                    daysAgo: 1,
                }),
            ],
        },
        {
            id: 'in-progress',
            title: 'In Progress',
            icon: 'i-lucide-timer',
            dotColor: 'bg-amber-500',
            cards: [
                makeCard('User authentication refactor', {
                    description: 'Migrate from JWT to session-based auth with rotating refresh tokens.',
                    priority: 'high',
                    tags: ['Backend', 'Security'],
                    daysAgo: 6,
                }),
                makeCard('Dashboard analytics v2', {
                    description: 'Rebuild analytics charts with Chart.js for better performance.',
                    priority: 'medium',
                    tags: ['Frontend'],
                    daysAgo: 3,
                }),
                makeCard('Mobile responsive fixes', {
                    description: 'Fix layout issues on screens smaller than 768px.',
                    priority: 'medium',
                    tags: ['Frontend', 'CSS'],
                    daysAgo: 1,
                }),
            ],
        },
        {
            id: 'review',
            title: 'Review',
            icon: 'i-lucide-eye',
            dotColor: 'bg-violet-500',
            cards: [
                makeCard('Payment integration', {
                    description: 'Locked: pending legal and compliance sign-off before this can be merged.',
                    priority: 'critical',
                    tags: ['Backend', 'Finance'],
                    locked: true,
                    daysAgo: 7,
                }),
                makeCard('Performance audit', {
                    description: 'Lighthouse audit + identify and document top 5 performance bottlenecks.',
                    priority: 'medium',
                    tags: ['DevOps', 'Performance'],
                    daysAgo: 2,
                }),
            ],
        },
        {
            id: 'done',
            title: 'Done',
            icon: 'i-lucide-circle-check-big',
            dotColor: 'bg-green-500',
            cards: [
                makeCard('Initial project setup', {
                    description: 'Project scaffolding with Nuxt 3 + Nuxt UI + Pinia.',
                    priority: 'low',
                    tags: ['Setup'],
                    locked: true,    // archived — immutable
                    daysAgo: 14,
                }),
                makeCard('Database schema design', {
                    description: 'ERD and initial migration scripts for all core entities.',
                    priority: 'high',
                    tags: ['Backend'],
                    daysAgo: 10,
                }),
                makeCard('UI component library', {
                    description: 'Base component system: buttons, badges, inputs, modals.',
                    priority: 'medium',
                    tags: ['Frontend', 'Design'],
                    daysAgo: 8,
                }),
            ],
        },
    ]
}

// ── Store ─────────────────────────────────────────────────────────────────
export const useKanbanStore = defineStore('kanbanStore', {
    state: () => ({
        // Columns always exist — cards are what get seeded / cleared
        columns: createColumnStructure() as KanbanColumn[],
    }),

    actions: {
        /** Move a card between (or within) columns. Inserts before insertBeforeCardId, or appends to end. */
        moveCard(
            cardId: string,
            fromColumnId: string,
            toColumnId: string,
            insertBeforeCardId?: string,
        ) {
            const fromCol = this.columns.find(c => c.id === fromColumnId)
            const toCol = this.columns.find(c => c.id === toColumnId)
            if (!fromCol || !toCol) return

            const cardIdx = fromCol.cards.findIndex(c => c.id === cardId)
            if (cardIdx === -1) return

            const [card] = fromCol.cards.splice(cardIdx, 1)
            if (!card) return   // splice always returns the element since cardIdx is valid, but TS can't prove that

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
            col.cards.unshift({
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                ...data,
            })
        },

        deployMockData() {
            this.columns = createInitialColumns()
        },

        removeMockData() {
            // Keep the column structure — only clear the cards
            this.columns.forEach(col => { col.cards = [] })
        },
    },

    getters: {
        // Columns always exist — hasData means there are cards, not columns
        hasData: (state) => state.columns.some(col => col.cards.length > 0),
        totalCards: (state) => state.columns.reduce((sum, col) => sum + col.cards.length, 0),
        lockedCount: (state) => state.columns.reduce(
            (sum, col) => sum + col.cards.filter(c => c.locked).length, 0,
        ),
    },

    persist: {
        storage: persistedState.localStorage,
    },
})
