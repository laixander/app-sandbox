<script setup lang="ts">
// ============================================================================
// Component Definition
// ============================================================================
interface Props {
    title?: string
    description?: string
    icon?: string
    loading?: boolean
    loadingTitle?: string
    loadingDescription?: string
}

withDefaults(defineProps<Props>(), {
    title: 'No records found',
    description: 'There is currently no data to display here. Try adjusting your filters or adding new entries.',
    icon: 'i-lucide-folder-open',
    loading: false,
    loadingTitle: 'Loading data...',
    loadingDescription: 'Please wait while we securely retrieve your records.'
})
</script>

<template>
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center w-full h-full min-h-[300px]">

        <!-- ========================================== -->
        <!-- Loading State                              -->
        <!-- ========================================== -->
        <template v-if="loading">
            <div class="relative flex items-center justify-center mb-6">
                <!-- <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                <div
                    class="relative flex items-center justify-center w-16 h-16 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200/60 dark:border-neutral-800 ring-8 ring-neutral-50 dark:ring-neutral-950/50">
                    <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-primary animate-spin" />
                </div> -->
                <div class="relative flex items-center justify-center w-16 h-16 rounded-3xl bg-muted/50">
                    <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight text-pretty mb-2">
                {{ loadingTitle }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed text-pretty">
                {{ loadingDescription }}
            </p>
        </template>

        <!-- ========================================== -->
        <!-- Empty State                                -->
        <!-- ========================================== -->
        <template v-else>
            <!-- Icon Container with Glow Effect -->
            <div class="relative flex items-center justify-center mb-8 group">
                <!-- Animated background glow -->
                <!-- <div class="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-[2] opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
                <div class="absolute inset-0 bg-neutral-200/50 dark:bg-neutral-800/50 blur-xl rounded-full scale-150"></div> -->

                <!-- Icon surface -->
                <!-- <div class="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200/60 dark:border-neutral-800 ring-8 ring-neutral-50 dark:ring-neutral-950/50 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1">
                    <UIcon :name="icon" class="w-10 h-10 text-neutral-400 dark:text-neutral-500 group-hover:text-primary transition-colors duration-500" />
                </div> -->

                <!-- Simple icon -->
                <div class="relative flex items-center justify-center w-20 h-20 rounded-4xl bg-muted/50">
                    <UIcon :name="icon"
                        class="w-10 h-10 text-neutral-400 dark:text-neutral-500 transition-colors duration-500" />
                </div>
            </div>

            <!-- Text Content -->
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight text-pretty mb-2">
                {{ title }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed text-pretty">
                {{ description }}
            </p>

            <!-- Optional Action Slot -->
            <div v-if="$slots.action" class="mt-8">
                <slot name="action" />
            </div>
        </template>
    </div>
</template>
