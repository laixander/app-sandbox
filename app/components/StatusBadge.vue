<script setup lang="ts">
/**
 * ============================================================================
 * Component: StatusBadge
 * ============================================================================
 * A reusable UI component that standardizes color-coding for all system statuses.
 * It maps PMS business statuses (e.g., 'Pending', 'In-House', 'Dirty') to Nuxt UI 
 * badge colors to ensure visual consistency across the entire application.
 */
import { computed } from 'vue'

const props = defineProps<{
    status: string
}>()

// We strictly type BadgeColor to match the allowed literal strings in Nuxt UI's <UBadge>.
// This prevents TypeScript errors when passing the computed color to the component.

type BadgeColor = 'success' | 'info' | 'error' | 'neutral' | 'primary' | 'secondary' | 'warning'

const colorMap: Record<string, BadgeColor> = {
    'Pending': 'warning',
    'Confirmed': 'primary',
    'In-House': 'success',
    'Done': 'neutral',
    'Cancelled': 'error',
    // Occupancy
    'Vacant': 'success',
    'Occupied': 'primary',
    // Clean
    'Clean': 'success',
    'Dirty': 'error',
    'Pickup': 'warning',
    'Inspected': 'success',
    // Condition
    'Normal': 'success',
    'Maintenance': 'error',
    // Folio
    'Open': 'warning',
    'Closed': 'primary',
    'Settled': 'success',
    // Room Types
    'Standard': 'neutral',
    'Deluxe': 'primary',
    'Family': 'info',
    'Executive Suite': 'warning',
    // Users & Roles
    'Administrator': 'primary',
    'Front Desk': 'info',
    'Billing': 'warning',
    'Housekeeping': 'secondary',
    'Active': 'success',
    'Inactive': 'error',
    // Fallback
    'default': 'neutral'
}

const badgeColor = computed(() => colorMap[props.status] || colorMap['default'])
</script>

<template>
    <UBadge :label="status" :color="badgeColor" variant="subtle" size="sm" />
</template>
