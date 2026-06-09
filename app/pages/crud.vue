<script setup lang="ts">
definePageMeta({
    title: 'CRUD',
    isTable: true,
})

import { ref, h, computed } from 'vue'
import { UAvatar, UBadge, UIcon, UButton, UDropdownMenu } from '#components'
import { StatusBadge } from '#components'
import { useUserStore } from '~/stores/userStore'
import { SeederService } from '~/utils/seeder'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'

const store = useUserStore()
const toast = useAppToast()
const { log } = useActivityLog()
const settings = useSettingsStore()

type User = typeof store.users[0]

// ── Modal state ────────────────────────────────────────────────────────────
const isOpen = ref(false)
const isEditing = ref(false)
const currentUserId = ref<string | null>(null)
const pendingSaveData = ref<{ name: string; role: string; email: string; avatar: string; status: 'Active' | 'Inactive' } | null>(null)
const modalRef = useTemplateRef('modalRef')

const openCreateModal = () => {
    isEditing.value = false
    currentUserId.value = null
    modalRef.value?.reset({ avatar: SeederService.generateSingleUser().avatar })
    isOpen.value = true
}

const openEditModal = (user: User) => {
    isEditing.value = true
    currentUserId.value = user.id
    modalRef.value?.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
    })
    isOpen.value = true
}

// Called by AddUserModal after Zod validation passes
const handleSave = (data: { name: string; role: string; email: string; avatar: string; status: 'Active' | 'Inactive' }) => {
    if (isEditing.value && currentUserId.value) {
        // Stash validated data then show confirmation
        pendingSaveData.value = data
        isOpen.value = false
        isEditConfirmOpen.value = true
    } else {
        const newUser = { id: crypto.randomUUID(), ...data }
        store.createUser(newUser)
        log('Users', 'created', `Created user "${data.name}" (${data.role})`, { meta: { id: newUser.id } })
        isOpen.value = false
        toast.success('User Created', `${data.name} has been added.`)
    }
}

const confirmSave = () => {
    if (currentUserId.value && pendingSaveData.value) {
        store.updateUser(currentUserId.value, { ...pendingSaveData.value })
        log('Users', 'updated', `Updated user "${pendingSaveData.value.name}" (${pendingSaveData.value.role})`, { meta: { id: currentUserId.value } })
        toast.success('User Updated', `${pendingSaveData.value.name}'s profile has been saved.`)
        pendingSaveData.value = null
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
        const user = store.users.find(u => u.id === pendingDeleteId.value)
        store.deleteUser(pendingDeleteId.value)
        log('Users', 'deleted', `Deleted user "${user?.name ?? 'Unknown'}"`, { meta: { id: pendingDeleteId.value } })
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => h(StatusBadge, {
            status: row.original.status,
            // icon: row.original.status === 'Active' ? 'i-lucide-circle-check' : 'i-lucide-circle-x',
        })
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

const viewMode = ref<'list' | 'card'>(settings.defaultViewMode)
const filteredUsers = computed(() => {
    if (!globalFilter.value) return store.users
    const search = globalFilter.value.toLowerCase()
    return store.users.filter((user: User) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search) ||
        user.status.toLowerCase().includes(search) ||
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

    <Teleport to="#header-actions-teleport">
        <UButton color="primary" icon="i-lucide-plus" label="Add User" size="sm" @click="openCreateModal()" />
    </Teleport>

    <ClientOnly>
        <UTable v-if="viewMode === 'list'" :data="store.users" :columns="tableColumns" :loading="store.isLoading"
            v-model:column-visibility="columnVisibility" v-model:global-filter="globalFilter" sticky ref="table"
            class="flex-1 scrollbar">
            <template #empty>
                <UEmpty variant="naked" icon="i-lucide-user" title="No users found"
                    description="There are currently no users to display. Add a new user to get started.">
                    <template #actions>
                        <UButton label="Add First User" icon="i-lucide-plus" color="primary" size="lg"
                            @click="openCreateModal()" />
                    </template>
                </UEmpty>
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
                            <UBadge :label="user.id.slice(0, 8)" variant="soft" color="neutral" class="font-mono" />
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
                        <div>
                            <div class="text-muted">Status</div>
                            <StatusBadge :status="user.status" />
                            <!-- <StatusBadge :status="user.status"
                                :icon="user.status === 'Active' ? 'i-lucide-circle-check' : 'i-lucide-circle-x'" /> -->
                        </div>
                    </div>
                </UCard>
            </div>
            <div v-else-if="store.isLoading" class="flex items-center justify-center h-full gap-3 text-muted">
                <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
                <p class="text-sm font-medium">Loading users…</p>
            </div>
            <UEmpty v-else variant="naked" icon="i-lucide-user" title="No users found"
                description="There are currently no users to display. Add a new user to get started.">
                <template #actions>
                    <UButton label="Add First User" icon="i-lucide-plus" color="primary" size="lg"
                        @click="openCreateModal()" />
                </template>
            </UEmpty>

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

    <!-- Add / Edit User Modal -->
    <AddUserModal ref="modalRef" v-model:open="isOpen" :is-editing="isEditing" @save="handleSave" />
</template>