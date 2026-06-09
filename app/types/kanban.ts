// ============================================================================
// Types: Kanban Board
// ============================================================================

export type KanbanPriority = 'low' | 'medium' | 'high' | 'critical'

export interface KanbanCard {
    id: string
    title: string
    description?: string
    priority: KanbanPriority
    tags: string[]
    /** If true, the card cannot be dragged to another column */
    locked: boolean
    createdAt: string
}

export interface KanbanColumn {
    id: string
    title: string
    icon: string
    dotColor: string    // Tailwind class, e.g. 'bg-blue-500'
    cards: KanbanCard[]
}
