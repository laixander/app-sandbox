<script setup lang="ts">
// ============================================================================
// Component Definition
// ============================================================================
const modelValue = defineModel<string>({ default: '' })

interface Props {
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Search...'
})
</script>

<template>
  <UInput 
    v-model="modelValue" 
    icon="i-lucide-search" 
    :placeholder="placeholder" 
    class="max-w-sm w-full" 
  />
</template>
