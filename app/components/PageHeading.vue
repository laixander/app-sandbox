<script setup lang="ts">
interface Props {
    title: string
    description?: string
    forTable?: boolean
}

const { title, description, forTable } = defineProps<Props>()
</script>

<template>
    <div class="flex items-center justify-between" :class="forTable ? 'p-4 border-b border-default' : ''">
        <div class="flex-1">
            <div class="text-2xl font-bold">
                <slot name="title">
                    {{ title }}
                </slot>
            </div>
            <div class="text-sm text-muted" v-if="description">
                <slot name="description">
                    {{ description }}
                </slot>
            </div>
        </div>
        <slot />
    </div>
</template>