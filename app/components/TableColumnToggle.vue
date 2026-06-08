<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { computed } from 'vue'
import { upperFirst } from 'scule'

// ============================================================================
// Component Definition
// ============================================================================
interface Props {
  /**
   * Reference to the UTable component instance
   */
  table: any
}

const props = defineProps<Props>()

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * Dynamically builds the dropdown menu items based on the table's available columns.
 */
const menuItems = computed(() => {
  if (!props.table?.tableApi) return []
  
  return props.table.tableApi
    .getAllColumns()
    .filter((column: any) => column.getCanHide())
    .map((column: any) => ({
      label: upperFirst(column.id),
      type: 'checkbox' as const,
      checked: column.getIsVisible(),
      onUpdateChecked(checked: boolean) {
        props.table.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
      },
      onSelect(e: Event) {
        e.preventDefault()
      }
    }))
})
</script>

<template>
  <UDropdownMenu :items="menuItems" :content="{ align: 'end' }">
    <UButton 
      label="Columns" 
      color="neutral" 
      variant="outline" 
      trailing-icon="i-lucide-chevron-down"
      class="w-fit" 
      :disabled="!table?.tableApi"
    />
  </UDropdownMenu>
</template>
