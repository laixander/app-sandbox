<script setup lang="ts">
/**
 * ============================================================================
 * Component: StatusBadge
 * ============================================================================
 * A reusable UI component that standardizes color-coding for all system statuses.
 * Maps known status strings to Nuxt UI badge colors via a central colorMap to
 * ensure visual consistency across the entire application.
 *
 * Props:
 *   status  — The status string to display and color-code (required)
 *   icon    — Optional Lucide icon name to show inside the badge
 *             (e.g. 'i-lucide-check-circle'). Falls back to no icon if omitted.
 */
import { computed } from 'vue'

const props = defineProps<{
    status: string
    icon?: string
}>()

// BadgeColor must stay in sync with ui.theme.colors in nuxt.config.ts.
// Adding a color there without adding it here will cause a TypeScript error.
type BadgeColor =
    | 'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
    | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal'
    | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'

const colorMap: Record<string, BadgeColor> = {
    // User entity status
    'Active':   'success',
    'Inactive': 'error',
    // Fallback
    'default': 'neutral',
}

const badgeColor = computed(() => colorMap[props.status] ?? colorMap['default'])
</script>

<template>
    <UBadge :label="status" :color="badgeColor" variant="subtle" size="sm" :icon="icon" />
</template>
