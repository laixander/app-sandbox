<script setup lang="ts">
// ============================================================================
// Component Definition
// ============================================================================
interface Props {
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmColor?: any
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmColor: 'primary'
})

const emit = defineEmits<{
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()

// ============================================================================
// State
// ============================================================================
const isOpen = defineModel<boolean>('open', { default: false })

// ============================================================================
// Methods
// ============================================================================

/**
 * Handle confirmation action
 */
function onConfirm() {
    isOpen.value = false
    emit('confirm')
}

/**
 * Handle cancellation action
 */
function onCancel() {
    isOpen.value = false
    emit('cancel')
}
</script>

<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'w-full sm:max-w-sm' }">
        <template #content="{ close }">
            <div class="flex flex-col gap-8 p-4 sm:p-6">
                <!-- Header -->
                <div class="flex flex-col items-center gap-4">
                    <UBadge icon="i-lucide-triangle-alert" :color="confirmColor" variant="soft"
                        :ui="{ leadingIcon: 'size-16' }" class="bg-transparent" />
                    <h3 class="text-lg font-semibold">{{ title }}</h3>
                    <p class="text-muted text-sm text-center text-pretty">
                        {{ description }}
                    </p>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col gap-2">
                    <UButton block size="lg" :label="cancelLabel" color="neutral" variant="ghost" @click="onCancel" />
                    <UButton block size="lg" :label="confirmLabel" :color="confirmColor" @click="onConfirm" />
                </div>
            </div>
            
            <!-- Close Button -->
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2" @click="close" />
        </template>
    </UModal>
</template>
