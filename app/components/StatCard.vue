<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    title: string
    value: string | number
    icon?: string
    trend?: string
    trendDirection?: 'up' | 'down' | 'flat'
}

const props = withDefaults(defineProps<Props>(), {
    trendDirection: 'up'
})

// Compute the appropriate icon depending on the trend direction
const trendIcon = computed(() => {
    if (props.trendDirection === 'down') {
        return 'i-lucide-arrow-down-right'
    }
    if (props.trendDirection === 'flat') {
        return 'i-lucide-minus'
    }
    return 'i-lucide-arrow-up-right'
})

// Compute color class for the trend label
const trendColorClass = computed(() => {
    if (props.trendDirection === 'down') {
        return 'text-error-500'
    }
    if (props.trendDirection === 'flat') {
        return 'text-neutral-500'
    }
    return 'text-green-500'
})
</script>

<template>
    <UCard :ui="{ body: 'px-4 py-5 sm:p-6' }" variant="subtle" class="shadow-sm">
        <div class="flex items-center justify-between">
            <div class="text-sm font-medium">{{ title }}</div>
            <UIcon v-if="icon" :name="icon" class="text-primary w-5 h-5 opacity-50" />
        </div>
        <div class="text-3xl font-bold mt-2">{{ value }}</div>
        <div v-if="trend" class="text-xs font-medium mt-2 flex items-center gap-1" :class="trendColorClass">
            <UIcon :name="trendIcon" class="w-3 h-3" />
            <span>{{ trend }}</span>
        </div>
    </UCard>
</template>
