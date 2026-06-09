<script setup lang="ts">
import type { NavigationMenuItem, SidebarProps } from '@nuxt/ui'

defineProps<Pick<SidebarProps, 'variant' | 'collapsible' | 'side'>>()
const variant = ref<SidebarProps['variant']>('inset')
const collapsible = ref<SidebarProps['collapsible']>('icon')
const settings = useSettingsStore()
const open = computed({
    get: () => !settings.sidebarCollapsed,
    set: (val: boolean) => settings.setSidebarCollapsed(!val),
})

const route = useRoute()
const { isAdmin } = useDemoAuth()
const notificationStore = useNotificationStore()

const allNavItems = computed<NavigationMenuItem[]>(() => [
    { type: 'label', label: 'Menu' },
    { label: 'Dashboard', icon: 'i-lucide-chart-pie', to: '/', meta: { adminOnly: true } },
    { label: 'CRUD', icon: 'i-lucide-folder-open', to: '/crud' },
    { label: 'Activity Logs', icon: 'i-lucide-activity', to: '/activity-logs' },
    {
        label: 'Notifications',
        icon: 'i-lucide-bell',
        to: '/notifications',
        badge: {
            // label: notificationStore.unreadCount > 0 ? String(notificationStore.unreadCount) : undefined,
            variant: notificationStore.unreadCount > 0 ? 'solid' : 'soft',
            color: notificationStore.unreadCount > 0 ? 'primary' : 'neutral',
            class: 'rounded-full'
        },
        meta: { adminOnly: true }
    },
    { label: 'Kanban', icon: 'i-lucide-kanban', to: '/kanban' },
    { label: 'Wizard', icon: 'i-lucide-wand-sparkles', to: '/wizard', meta: { adminOnly: true } },
    { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
])

const items = computed<NavigationMenuItem[][]>(() => [
    [
        ...allNavItems.value.filter(item => !(item as any).meta?.adminOnly || isAdmin.value)
    ]
])

const isCollapsed = computed(() => collapsible.value === 'icon' && !open.value)
const pageTitle = computed(() => route.meta.title as string)
</script>

<template>
    <ClientOnly>
        <div class="flex flex-1 h-screen w-full" :class="[
            variant === 'inset' && 'bg-neutral-50 dark:bg-neutral-950',
            side === 'right' && 'flex-row-reverse'
        ]">
            <USidebar v-model:open="open" :variant="variant" :collapsible="collapsible" :side="side"
                :ui="{ root: '[--sidebar-width-icon:4.5625rem]', container: 'h-full', header: 'px-5', body: 'scrollbar' }"
                close>
                <template #header="{ close }">
                    <div class="flex items-center gap-2.5">
                        <UIcon name="i-ph-codesandbox-logo-duotone" class="size-8 shrink-0 text-primary" />
                        <span v-if="!isCollapsed"
                            class="font-black text-neutral-900 dark:text-white tracking-tight">Sand<span
                                class="text-primary">Box</span></span>
                    </div>
                    <UButton class="lg:hidden ml-auto" icon="i-lucide-x" color="neutral" variant="ghost"
                        aria-label="Close sidebar" @click="close()" />
                </template>

                <UNavigationMenu :items="items" orientation="vertical" :collapsed="isCollapsed" :tooltip="{
                    delayDuration: 200,
                    content: { side: 'right', sideOffset: 12 },
                    arrow: true,
                }" popover :ui="{
                    root: 'gap-2.5',
                    label: 'text-default uppercase tracking-widest py-2.5',
                    link: 'p-2.5',
                    list: 'space-y-0.5'
                }" />
                <template #footer>
                    <UserMenu :collapsed="isCollapsed" />
                </template>

            </USidebar>

            <div
                class="flex-1 flex flex-col overflow-hidden lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow-sm peer-data-[variant=inset]:ring peer-data-[variant=inset]:ring-default bg-default">
                <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 sm:pe-6" :class="[
                    variant !== 'floating' && 'border-b border-default',
                    side === 'right' && 'justify-end'
                ]">
                    <UButton :icon="side === 'left' ? 'i-lucide-panel-left' : 'i-lucide-panel-right'" color="neutral"
                        variant="ghost" aria-label="Toggle sidebar" class="mr-2" @click="open = !open" />
                    <!-- setup title in page, not here -->
                    <h1 class="font-bold">{{ pageTitle }}</h1>
                    <div class="ml-auto flex items-center gap-2">
                        <!-- Dynamic teleport target for pages that need reactive header actions -->
                        <div id="header-actions-teleport" class="flex items-center gap-2"></div>
                    </div>
                </div>

                <div :class="[
                    'flex-1',
                    route.meta.isTable ? 'flex flex-col overflow-hidden min-h-0' : 'p-4 overflow-y-auto scrollbar'
                ]">
                    <slot />
                </div>
            </div>
        </div>
        <DemoFab />
    </ClientOnly>
</template>