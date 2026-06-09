<script setup lang="ts">
definePageMeta({
    title: 'Settings',
})

const { currentUser, isAdmin, logout } = useDemoAuth()
const settings = useSettingsStore()
const activityLogStore = useActivityLogStore()
const toast = useAppToast()
const colorMode = useColorMode()
const appConfig = useAppConfig()

// ── Avatar seed (stable, derived from name) ───────────────────────────────
const avatarSeed = computed(() => currentUser.value?.name.replace(' ', '') ?? 'Guest')
const avatarUrl = computed(() => `https://api.dicebear.com/10.x/thumbs/svg?seed=${avatarSeed.value}`)

// ── Appearance ────────────────────────────────────────────────────────────
const isDark = computed({
    get: () => colorMode.value === 'dark',
    set: (val) => { colorMode.preference = val ? 'dark' : 'light' },
})

const primaryColors = ['teal', 'blue', 'violet', 'rose', 'orange', 'emerald', 'sky', 'pink', 'indigo']
const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

// ── Data Management ───────────────────────────────────────────────────────
const isClearLogsConfirmOpen = ref(false)
const isResetDefaultsConfirmOpen = ref(false)

const confirmClearLogs = () => {
    activityLogStore.clearLogs()
    toast.error('Logs Cleared', 'All activity logs have been permanently removed.')
}

const confirmResetSettings = () => {
    settings.resetToDefaults()
    toast.success('Settings Reset', 'All preferences have been restored to defaults.')
}
</script>

<template>
    <div class="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

        <!-- ── Account ────────────────────────────────────────────────── -->
        <UCard variant="subtle" class="shadow-sm">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-user-circle" class="size-5 shrink-0 text-muted" />
                    <span class="font-semibold text-sm">Account</span>
                </div>
            </template>

            <div class="flex justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <UAvatar :src="avatarUrl" :alt="currentUser?.name ?? 'User'" size="xl" />
                    <div class="space-y-1 min-w-0">
                        <div class="font-bold text-lg truncate">{{ currentUser?.name ?? 'Guest' }}</div>
                        <UBadge :label="currentUser?.role ?? ''" :color="isAdmin ? 'primary' : 'neutral'"
                            variant="soft" />
                        <div class="text-xs text-muted pt-1">Demo session — credentials are not real</div>
                    </div>
                </div>

                <UButton label="Log out" color="error" variant="soft" icon="i-lucide-log-out" @click="logout()" />
            </div>
        </UCard>

        <!-- ── Display Preferences ────────────────────────────────────── -->
        <UCard variant="subtle" class="shadow-sm">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-sliders-horizontal" class="size-5 shrink-0 text-muted" />
                    <span class="font-semibold text-sm">Display Preferences</span>
                </div>
            </template>

            <div class="*:py-6 *:first:pt-0 *:last:pb-0 divide-y divide-default">
                <!-- Default View Mode -->
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <div class="text-sm font-medium">Default View Mode</div>
                        <div class="text-xs text-muted">Applied when opening list pages for the first time</div>
                    </div>
                    <UTabs :model-value="settings.defaultViewMode" variant="pill" size="sm" :content="false" :items="[
                        { value: 'list', icon: 'i-lucide-list', label: 'List' },
                        { value: 'card', icon: 'i-lucide-grid-2x2', label: 'Card' },
                    ]" @update:model-value="settings.setDefaultViewMode($event as 'list' | 'card')" />
                </div>

                <!-- Collapsed Sidebar -->
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <div class="text-sm font-medium">Collapsed Sidebar</div>
                        <div class="text-xs text-muted">Keep the sidebar in icon-only view</div>
                    </div>
                    <USwitch :model-value="settings.sidebarCollapsed"
                        @update:model-value="settings.setSidebarCollapsed($event)" />
                </div>
            </div>
        </UCard>

        <!-- ── Appearance ─────────────────────────────────────────────── -->
        <UCard variant="subtle" class="shadow-sm">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-palette" class="size-5 shrink-0 text-muted" />
                    <span class="font-semibold text-sm">Appearance</span>
                </div>
            </template>

            <div class="*:py-6 *:first:pt-0 *:last:pb-0 divide-y divide-default">
                <!-- Dark Mode -->
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <div class="text-sm font-medium">Dark Mode</div>
                        <div class="text-xs text-muted">Switch between light and dark interface</div>
                    </div>
                    <USwitch v-model="isDark" />
                </div>

                <!-- Primary Color -->
                <div class="space-y-3">
                    <div>
                        <div class="text-sm font-medium">Accent Color</div>
                        <div class="text-xs text-muted">Sets the primary color for buttons, badges, and links</div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <UTooltip :text="color.charAt(0).toUpperCase() + color.slice(1)" v-for="color in primaryColors"
                            :key="color">
                            <button
                                class="size-7 rounded-full ring-2 ring-offset-2 ring-offset-default transition-all flex items-center justify-center"
                                :class="[
                                    appConfig.ui.colors.primary === color
                                        ? 'ring-default scale-110'
                                        : 'ring-transparent hover:scale-105'
                                ]" :style="`background-color: var(--color-${color}-500)`"
                                :aria-label="`Set ${color} as primary color`"
                                @click="appConfig.ui.colors.primary = color">
                                <UIcon v-if="appConfig.ui.colors.primary === color" name="i-lucide-check"
                                    class="size-3.5 text-white drop-shadow" />
                            </button>
                        </UTooltip>
                    </div>
                </div>

                <!-- Neutral Color -->
                <div class="space-y-3">
                    <div>
                        <div class="text-sm font-medium">Neutral Color</div>
                        <div class="text-xs text-muted">Sets the neutral color for backgrounds, borders, and text</div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <UTooltip :text="color.charAt(0).toUpperCase() + color.slice(1)" v-for="color in neutralColors"
                            :key="color">
                            <button
                                class="size-7 rounded-full ring-2 ring-offset-2 ring-offset-default transition-all flex items-center justify-center"
                                :class="[
                                    appConfig.ui.colors.neutral === color
                                        ? 'ring-default scale-110'
                                        : 'ring-transparent hover:scale-105'
                                ]" :style="`background-color: var(--color-${color}-500)`"
                                :aria-label="`Set ${color} as neutral color`"
                                @click="appConfig.ui.colors.neutral = color">
                                <UIcon v-if="appConfig.ui.colors.neutral === color" name="i-lucide-check"
                                    class="size-3.5 text-white drop-shadow" />
                            </button>
                        </UTooltip>
                    </div>
                </div>
            </div>
        </UCard>

        <!-- ── Data Management ────────────────────────────────────────── -->
        <UCard variant="subtle" class="shadow-sm">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-database" class="size-5 shrink-0 text-muted" />
                    <span class="font-semibold text-sm">Data Management</span>
                </div>
            </template>

            <div class="*:py-6 *:first:pt-0 *:last:pb-0 divide-y divide-default">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <div class="text-sm font-medium">Activity Logs</div>
                        <div class="text-xs text-muted">
                            {{ activityLogStore.totalLogs > 0
                                ? `${activityLogStore.totalLogs} log entries stored`
                                : 'No activity logs recorded yet' }}
                        </div>
                    </div>
                    <UButton color="error" variant="soft" size="sm" icon="i-lucide-trash-2"
                        :disabled="!activityLogStore.hasLogs" @click="isClearLogsConfirmOpen = true">
                        Clear Logs
                    </UButton>
                </div>

                <div class="flex items-center justify-between gap-4">
                    <div>
                        <div class="text-sm font-medium">Reset Preferences</div>
                        <div class="text-xs text-muted">Restore all display settings to their defaults</div>
                    </div>
                    <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-rotate-ccw"
                        @click="isResetDefaultsConfirmOpen = true">
                        Reset to Defaults
                    </UButton>
                </div>
            </div>
        </UCard>
    </div>

    <!-- Confirmation Modals -->
    <ConfirmationModal v-model:open="isClearLogsConfirmOpen" title="Clear all activity logs?"
        description="This will permanently delete all activity logs. This action cannot be undone."
        confirm-label="Yes, Clear All" confirm-color="error" @confirm="confirmClearLogs" />

    <ConfirmationModal v-model:open="isResetDefaultsConfirmOpen" title="Reset settings to defaults?"
        description="Your display preferences will be restored. This cannot be undone." confirm-label="Yes, Reset"
        confirm-color="warning" @confirm="confirmResetSettings" />
</template>
