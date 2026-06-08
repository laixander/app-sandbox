<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

// ============================================================================
// Composables & State
// ============================================================================
const store = useUserStore()
const toast = useAppToast()

const isLoading = computed(() => store.isLoading)
const isDataDeployed = computed(() => store.hasUsers)

// ============================================================================
// Confirmation Modal
// ============================================================================
const isResetConfirmOpen = ref(false)

// ============================================================================
// Methods
// ============================================================================

/**
 * Handle mass seeding of demo data
 */
const handleSeed = async () => {
    try {
        await store.deployMockData(9)
        toast.success('Data Deployed', '9 users have been seeded into the system.')
    } catch {
        toast.error('Seed Failed', 'Could not deploy demo data.')
    }
}

/**
 * Prompt confirmation before resetting
 */
const promptReset = () => {
    isResetConfirmOpen.value = true
}

/**
 * Handle resetting of the demo system after confirmation
 */
const handleReset = () => {
    try {
        store.removeMockData()
        toast.success('System Reset', 'All user data has been cleared.')
    } catch {
        toast.error('Reset Failed', 'Could not clear the data.')
    }
}

// ============================================================================
// Configuration
// ============================================================================
const staticGroups = [
    [
        {
            label: 'Application',
            icon: 'i-lucide-box',
            color: 'primary',
            to: '/'
        }
    ],
    // [
    //     {
    //         label: 'Presentation',
    //         icon: 'i-lucide-airplay',
    //         to: '/docs/presentation'
    //     },
    //     {
    //         label: 'Documentation',
    //         icon: 'i-lucide-book',
    //         to: '/docs/documentation'
    //     },
    //     {
    //         label: 'User Manual',
    //         icon: 'i-lucide-user',
    //         to: '/docs/user-manual'
    //     },
    //     {
    //         label: 'Implementation',
    //         icon: 'i-lucide-construction',
    //         to: '/docs/implementation'
    //     },
    //     {
    //         label: 'Agent Kit',
    //         icon: 'i-lucide-bot',
    //         to: '/agent/ai-rules'
    //     },
    //     {
    //         label: 'Changelog',
    //         icon: 'i-lucide-file-text',
    //         to: '/docs/changelog'
    //     },
    // ],
]

const items = computed(() => {
    const groups: any[][] = [...staticGroups]

    if (isDataDeployed.value) {
        // Reset group
        groups.push([
            {
                label: 'Reset System',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect: promptReset
            }
        ])
    } else {
        // Seed group
        groups.push([
            {
                label: 'Deploy Demo Data',
                icon: 'i-lucide-database-zap',
                color: 'success',
                onSelect: handleSeed
            }
        ])
    }

    return groups
})

// ============================================================================
// Draggable Logic
// ============================================================================
const position = ref({ x: 24, y: 24 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const initialPosition = ref({ x: 0, y: 0 })
const hasMoved = ref(false)
const fabRef = ref<HTMLElement | null>(null)
const isOnLeftSide = ref(false)

const dropdownAlign = computed(() => isOnLeftSide.value ? 'start' : 'end')

/**
 * Detect if FAB is on the left or right half of the viewport
 */
const updateSideDetection = () => {
    if (!fabRef.value) return
    const rect = fabRef.value.getBoundingClientRect()
    const fabCenterX = rect.left + rect.width / 2
    isOnLeftSide.value = fabCenterX < window.innerWidth / 2
}

/**
 * Handle mouse down event on the FAB to start dragging
 */
const handleMouseDown = (e: MouseEvent) => {
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
    initialPosition.value = { ...position.value }
    hasMoved.value = false

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
}

/**
 * Update position during drag
 */
const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return

    const dx = e.clientX - dragStart.value.x
    const dy = e.clientY - dragStart.value.y

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved.value = true
    }

    position.value = {
        x: initialPosition.value.x - dx,
        y: initialPosition.value.y - dy
    }

    updateSideDetection()
}

/**
 * End drag
 */
const handleMouseUp = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
}

// Initialize side detection
onMounted(() => {
    nextTick(updateSideDetection)
})
</script>

<template>
    <ClientOnly>
        <div ref="fabRef" class="fixed z-[999] group select-none" :style="{
            bottom: `${position.y}px`,
            right: `${position.x}px`,
        }">
            <!-- Main FAB -->
            <UDropdownMenu :items="items" :content="{ align: dropdownAlign, side: 'top', sideOffset: 12 }"
                :ui="{ content: 'w-44' }" :prevent-close="hasMoved">
                <UButton square size="xl" color="primary" :loading="isLoading"
                    class="rounded-full hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-primary-500/20 cursor-move"
                    :class="{ 'animate-pulse': isLoading }" @mousedown="handleMouseDown"
                    @click.capture="hasMoved ? $event.stopPropagation() : null">
                    <template #leading>
                        <UIcon v-if="!isLoading" name="i-lucide-database" class="w-6 h-6" />
                    </template>
                    <span class="sr-only">Demo Tools</span>
                </UButton>

                <template #item="{ item }">
                    <div class="flex items-center gap-2 w-full">
                        <UIcon :name="item.icon" class="w-4 h-4" :class="item.class" />
                        <span>{{ item.label }}</span>
                    </div>
                </template>
            </UDropdownMenu>

            <!-- Tooltip hint (visible on hover, auto-adjusts side) -->
            <span v-if="isOnLeftSide"
                class="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-neutral-800">
                Demo Control Center
            </span>
            <span v-else
                class="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-neutral-800">
                Demo Control Center
            </span>
        </div>

        <!-- Reset Confirmation Modal -->
        <ConfirmationModal
            v-model:open="isResetConfirmOpen"
            title="Reset all data?"
            description="This will permanently delete all seeded users. This action cannot be undone."
            confirm-label="Yes, Reset"
            confirm-color="error"
            @confirm="handleReset"
        />
    </ClientOnly>
</template>