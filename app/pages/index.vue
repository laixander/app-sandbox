<script setup lang="ts">
definePageMeta({
    title: 'NuxtUI',
    isTable: true,
})

import { ref, h, computed } from 'vue'
import { UAvatar, UBadge, UIcon, UButton, UDropdownMenu } from '#components'
import { useUserStore } from '~/stores/userStore'
import { SeederService } from '~/utils/seeder'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'

const store = useUserStore()
const toast = useAppToast()

type User = typeof store.users[0]

const isOpen = ref(false)
const isEditing = ref(false)
const currentUserId = ref<string | null>(null)

const form = ref({
    name: '',
    email: '',
    role: '',
    avatar: ''
})

const openCreateModal = () => {
    isEditing.value = false
    currentUserId.value = null
    form.value = {
        name: '',
        email: '',
        role: '',
        avatar: SeederService.generateSingleUser().avatar
    }
    isOpen.value = true
}

const openEditModal = (user: User) => {
    isEditing.value = true
    currentUserId.value = user.id
    form.value = {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
    }
    isOpen.value = true
}

const handleSave = () => {
    if (isEditing.value && currentUserId.value) {
        // Show confirmation before saving edits
        isOpen.value = false
        isEditConfirmOpen.value = true
    } else {
        store.createUser({
            id: crypto.randomUUID(),
            ...form.value
        })
        isOpen.value = false
        toast.success('User Created', `${form.value.name} has been added.`)
    }
}

const confirmSave = () => {
    if (currentUserId.value) {
        store.updateUser(currentUserId.value, { ...form.value })
        toast.success('User Updated', `${form.value.name}'s profile has been saved.`)
    }
}

// Confirmation modals state
const isDeleteConfirmOpen = ref(false)
const isEditConfirmOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

const promptDelete = (userId: string) => {
    pendingDeleteId.value = userId
    isDeleteConfirmOpen.value = true
}

const confirmDelete = () => {
    if (pendingDeleteId.value) {
        store.deleteUser(pendingDeleteId.value)
        toast.error('User Deleted', 'The user has been permanently removed.')
        pendingDeleteId.value = null
    }
}

const tableColumns: TableColumn<User>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-2.5' }, [
            h(UAvatar, {
                src: row.original.avatar,
                alt: row.original.name,
                size: 'sm'
            }),
            h('span', { class: 'text-default font-semibold' }, row.original.name)
        ])
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => h('span', { class: '' }, row.original.role)
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => h('span', { class: 'flex items-center gap-1' }, [
            h(UIcon, { name: 'i-lucide-mail', class: 'w-3.5 h-3.5 shrink-0' }),
            row.original.email
        ])
    },
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => h(UBadge, {
            label: row.original.id.slice(0, 8),
            variant: 'soft',
            color: 'neutral',
            class: 'font-mono text-[11px]'
        })
    },
    {
        id: 'actions',
        header: '',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'Edit',
                        icon: 'i-lucide-pencil',
                        onSelect: () => openEditModal(row.original)
                    }
                ],
                [
                    {
                        label: 'Delete',
                        icon: 'i-lucide-trash',
                        color: 'error',
                        onSelect: () => promptDelete(row.original.id)
                    }
                ]
            ]

            return h(UDropdownMenu, {
                items,
                content: { align: 'end' },
                size: 'sm'
            }, {
                default: () => h(UButton, {
                    icon: 'i-lucide-ellipsis-vertical',
                    color: 'neutral',
                    variant: 'ghost',
                    size: 'sm'
                })
            })
        }
    }
]
const table = useTemplateRef('table')
const globalFilter = ref('')
const columnVisibility = ref({
    id: false
})

const viewMode = ref<'list' | 'card'>('list')
const filteredUsers = computed(() => {
    if (!globalFilter.value) return store.users
    const search = globalFilter.value.toLowerCase()
    return store.users.filter((user: User) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search) ||
        user.id.toLowerCase().includes(search)
    )
})
</script>

<template>
    <PageHeading forTable title="Users" description="List of users in the system">
        <div class="flex gap-2">
            <TableGlobalFilter v-model="globalFilter" />
            <TableColumnToggle v-if="viewMode === 'list'" :table="table" />
            <UTabs v-model="viewMode" variant="pill" size="xs" :content="false" :items="[
                { value: 'card', icon: 'i-lucide-grid-2x2' },
                { value: 'list', icon: 'i-lucide-list' },
            ]" />
        </div>
    </PageHeading>
    <ClientOnly>
        <UTable v-if="viewMode === 'list'" :data="store.users" :columns="tableColumns" :loading="store.isLoading"
            v-model:column-visibility="columnVisibility" v-model:global-filter="globalFilter" sticky ref="table"
            class="flex-1 scrollbar">
            <template #empty>
                <Empty :loading="store.isLoading" title="No users found"
                    description="There are currently no users to display. Add a new user to get started."
                    icon="i-lucide-user" loading-title="Loading Users"
                    loading-description="Please wait while we fetch your users inventory.">
                    <template #action>
                        <UButton label="Add First User" icon="i-lucide-plus" color="primary" size="lg"
                            @click="openCreateModal()" />
                    </template>
                </Empty>
            </template>
        </UTable>
        <div v-else class="flex-1 overflow-y-auto scrollbar p-4">
            <div v-if="filteredUsers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <UCard v-for="user in filteredUsers" :key="user.id" variant="subtle"
                    :ui="{ header: 'flex items-center justify-between gap-4', footer: 'p-0 sm:p-0' }" class="shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UAvatar :src="user.avatar" :alt="user.name" size="lg" />
                            <div class="text-sm font-bold truncate">{{ user.name }}</div>
                        </div>
                        <UDropdownMenu :items="[[
                            { label: 'Edit', icon: 'i-lucide-edit', onSelect: () => openEditModal(user) }
                        ], [
                            { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => promptDelete(user.id) }
                        ]]" :content="{ align: 'end' }" size="sm">
                            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
                        </UDropdownMenu>
                    </template>
                    <div
                        class="*:py-2 *:first:pt-0 *:last:pb-0 *:flex *:items-center *:justify-between text-sm divide-y divide-default">
                        <div>
                            <div class="text-muted w-full">ID</div>
                            <UBadge :label="user.id.slice(0, 8)" variant="soft" color="neutral" />
                        </div>
                        <div>
                            <div class="text-muted">Role</div>
                            <span class="truncate">{{ user.role }}</span>
                        </div>
                        <div>
                            <div class="text-muted w-full">Email</div>
                            <div class="flex items-center justify-end gap-1 w-full overflow-hidden">
                                <UIcon name="i-lucide-mail" class="w-3.5 h-3.5 shrink-0" />
                                <span class="truncate">{{ user.email }}</span>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
            <Empty v-else :loading="store.isLoading" title="No users found"
                description="There are currently no users to display. Add a new user to get started."
                icon="i-lucide-user" loading-title="Loading Users"
                loading-description="Please wait while we fetch your users inventory.">
                <template #action>
                    <UButton label="Add First User" icon="i-lucide-plus" color="primary" size="lg"
                        @click="openCreateModal()" />
                </template>
            </Empty>

        </div>
    </ClientOnly>

    <!-- Edit Save Confirmation Modal -->
    <ConfirmationModal v-model:open="isEditConfirmOpen" title="Save changes?"
        description="Are you sure you want to update this user's information?" confirm-label="Yes, Save"
        confirm-color="warning" @confirm="confirmSave" />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal v-model:open="isDeleteConfirmOpen" title="Delete user?"
        description="This will permanently remove the user. This action cannot be undone." confirm-label="Yes, Delete"
        confirm-color="error" @confirm="confirmDelete" />

    <UModal v-model:open="isOpen" :title="isEditing ? 'Modify Profile Details' : 'Register New Profile'">
        <template #body>
            <div class="space-y-4">
                <UFormField label="Full Name" required>
                    <UInput v-model="form.name" placeholder="John Doe" class="w-full" />
                </UFormField>
                <UFormField label="Job Assignment" required>
                    <UInput v-model="form.role" placeholder="Systems Engineer" class="w-full" />
                </UFormField>
                <UFormField label="Electronic Mail" required>
                    <UInput v-model="form.email" type="email" placeholder="john.doe@enterprise.io" class="w-full" />
                </UFormField>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton variant="ghost" color="neutral" @click="isOpen = false">Dismiss</UButton>
                <UButton color="primary" @click="handleSave">{{ isEditing ? 'Save Changes' : 'Save Record' }}</UButton>
            </div>
        </template>
    </UModal>
</template>