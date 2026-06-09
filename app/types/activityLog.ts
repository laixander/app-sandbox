// ============================================================================
// Type: ActivityLog
// ============================================================================
// Defines the shape of a single activity log entry captured from real user
// actions across all modules. Seeder / mock-data operations are excluded.

export type ActivityLogAction = 'created' | 'updated' | 'deleted' | 'viewed'

export interface ActivityLog {
    /** Unique identifier for the log entry */
    id: string

    /** ISO 8601 timestamp of when the action occurred */
    timestamp: string

    /** The module/section where the action took place (e.g. 'Users') */
    module: string

    /** The type of action performed */
    action: ActivityLogAction

    /** Human-readable description of the event */
    description: string

    /**
     * The actor who performed the action.
     * Placeholder for future authentication integration.
     */
    actor?: string

    /** Optional structured metadata for additional context */
    meta?: Record<string, unknown>
}
