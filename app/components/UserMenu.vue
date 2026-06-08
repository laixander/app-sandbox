<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
    collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()
// const authStore = useDemoAuth()
const router = useRouter()


const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

const items = computed<DropdownMenuItem[][]>(() => [
    // Header Info
    // Role Switcher
    // Show All Page
    // Theme options
    [{
        label: 'Theme Color',
        icon: 'i-lucide-palette',
        children: [{
            label: 'Primary',
            slot: 'chip',
            chip: appConfig.ui.colors.primary,
            content: { align: 'center', collisionPadding: 16 },
            children: colors.map(color => ({
                label: color,
                chip: color,
                slot: 'chip',
                checked: appConfig.ui.colors.primary === color,
                type: 'checkbox',
                onSelect: (e: Event) => {
                    e.preventDefault()
                    appConfig.ui.colors.primary = color
                }
            }))
        }, {
            label: 'Neutral',
            slot: 'chip',
            chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
            content: { align: 'end', collisionPadding: 16 },
            children: neutrals.map(color => ({
                label: color,
                chip: color === 'neutral' ? 'old-neutral' : color,
                slot: 'chip',
                type: 'checkbox',
                checked: appConfig.ui.colors.neutral === color,
                onSelect: (e: Event) => {
                    e.preventDefault()
                    appConfig.ui.colors.neutral = color
                }
            }))
        }]
    }, {
        label: 'Appearance',
        icon: 'i-lucide-sun-moon',
        children: [{
            label: 'Light',
            icon: 'i-lucide-sun',
            type: 'checkbox',
            checked: colorMode.value === 'light',
            onSelect(e: Event) {
                e.preventDefault()
                colorMode.preference = 'light'
            }
        }, {
            label: 'Dark',
            icon: 'i-lucide-moon',
            type: 'checkbox',
            checked: colorMode.value === 'dark',
            onUpdateChecked(checked: boolean) {
                if (checked) {
                    colorMode.preference = 'dark'
                }
            },
            onSelect(e: Event) {
                e.preventDefault()
            }
        }]
    }],
    [{
        label: 'Log out',
        icon: 'i-lucide-log-out',
        onSelect: () => {
            router.push('/')
        }
    }]
])
</script>

<template>
    <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">

        <UButton color="neutral" variant="ghost" :square="collapsed"
            class="data-[state=open]:bg-elevated/50 py-2.5 w-full">
            <template #leading>
                <UAvatar src="https://api.dicebear.com/10.x/thumbs/svg?seed=Felix" alt="John Doe" size="xs" />
            </template>
            <span v-if="!collapsed" class="flex-1 text-left">John Doe</span>
            <template #trailing v-if="!collapsed">
                <UIcon name="i-lucide-chevrons-up-down" class="size-5" />
            </template>
        </UButton>

        <template #chip-leading="{ item }">
            <div class="inline-flex items-center justify-center shrink-0 size-5">
                <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
                    '--chip-light': `var(--color-${(item as any).chip}-500)`,
                    '--chip-dark': `var(--color-${(item as any).chip}-400)`
                }" />
            </div>
        </template>
    </UDropdownMenu>
</template>
