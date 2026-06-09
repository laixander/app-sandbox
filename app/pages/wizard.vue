<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import { z } from 'zod'
import type { User } from '~/types/user'

definePageMeta({ title: 'New User Wizard' })

const store = useUserStore()
const toast = useAppToast()
const { log } = useActivityLog()
const { notify } = useNotify()

// ── Stepper ───────────────────────────────────────────────────────────────
const stepper = useTemplateRef('stepper')
const currentStep = ref(0)
const isSubmitting = ref(false)
const createdUser = ref<User | null>(null)

const steps = [
    {
        title: 'Personal Info',
        description: 'Name and contact',
        icon: 'i-lucide-user',
    },
    {
        title: 'Role & Status',
        description: 'Access level',
        icon: 'i-lucide-shield-check',
    },
    {
        title: 'Review',
        description: 'Confirm details',
        icon: 'i-lucide-clipboard-check',
    },
    {
        title: 'Done',
        description: 'User created',
        icon: 'i-lucide-circle-check',
    },
] satisfies StepperItem[]

// ── Step 1 — Personal Info ────────────────────────────────────────────────
const personalSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
})

const personalData = reactive({ name: '', email: '' })
const personalFormRef = useTemplateRef('personalForm')

const onPersonalSubmit = () => stepper.value?.next()

// ── Step 2 — Role & Status ────────────────────────────────────────────────
const roleSchema = z.object({
    role: z.enum(['Admin', 'Staff']),
    status: z.enum(['Active', 'Inactive']),
})

const roleData = reactive<{ role: 'Admin' | 'Staff'; status: 'Active' | 'Inactive' }>({
    role: 'Staff',
    status: 'Active',
})
const roleFormRef = useTemplateRef('roleForm')

const onRoleSubmit = () => stepper.value?.next()

const roleOptions = [
    {
        value: 'Admin',
        label: 'Admin',
        description: 'Full access: dashboard, settings, and all pages',
    },
    {
        value: 'Staff',
        label: 'Staff',
        description: 'Limited access: CRUD pages and activity logs',
    },
]

// ── Step 3 — Submit ───────────────────────────────────────────────────────
const avatarSeed = computed(() =>
    encodeURIComponent(personalData.name || personalData.email || 'default'),
)

const avatarPreview = computed(() =>
    `https://api.dicebear.com/10.x/thumbs/svg?seed=${avatarSeed.value}`,
)

const handleSubmit = async () => {
    isSubmitting.value = true
    await new Promise(r => setTimeout(r, 600))

    const user: User = {
        id: crypto.randomUUID(),
        name: personalData.name,
        email: personalData.email,
        role: roleData.role,
        status: roleData.status,
        avatar: avatarPreview.value,
    }

    store.createUser(user)
    log('Wizard', 'created', `Created user ${user.name} via wizard`, { meta: { role: user.role } })
    notify('User Created', `${user.name} has been added to the system.`, 'success', 'Wizard')
    toast.success('User Created', `${user.name} was added successfully.`)

    createdUser.value = user
    isSubmitting.value = false
    stepper.value?.next()
}

// ── Navigation ────────────────────────────────────────────────────────────
const handleNext = () => {
    if (currentStep.value === 0) personalFormRef.value?.submit()
    else if (currentStep.value === 1) roleFormRef.value?.submit()
    else if (currentStep.value === 2) handleSubmit()
}

const handleBack = () => stepper.value?.prev()

const resetWizard = () => {
    currentStep.value = 0
    Object.assign(personalData, { name: '', email: '' })
    Object.assign(roleData, { role: 'Staff', status: 'Active' })
    createdUser.value = null
}
</script>

<template>
    <PageHeading title="New User Wizard" description="Create a user account in a few guided steps" />

    <div class="w-full max-w-2xl mx-auto mt-4 sm:mt-8 space-y-6">

        <!-- ── Stepper header ── -->
        <UStepper ref="stepper" v-model="currentStep" :items="steps" disabled class="w-full" />

        <!-- ── Step content ── -->
        <UCard variant="subtle" class="shadow-sm min-h-64">
            <Transition name="wizard-slide" mode="out-in">
                <div :key="currentStep">

                    <!-- Step 0: Personal Info -->
                    <div v-if="currentStep === 0" class="space-y-5">
                        <div>
                            <p class="text-sm font-semibold text-highlighted">Personal Information</p>
                            <p class="text-xs text-muted mt-0.5">Tell us who this user is</p>
                        </div>
                        <UForm ref="personalForm" :schema="personalSchema" :state="personalData" class="space-y-4"
                            @submit="onPersonalSubmit">
                            <UFormField label="Full Name" name="name" required>
                                <UInput v-model="personalData.name" placeholder="e.g. Alex Johnson" icon="i-lucide-user"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Email Address" name="email" required>
                                <UInput v-model="personalData.email" type="email" placeholder="e.g. alex@example.com"
                                    icon="i-lucide-mail" class="w-full" />
                            </UFormField>
                        </UForm>
                    </div>

                    <!-- Step 1: Role & Status -->
                    <div v-else-if="currentStep === 1" class="space-y-5">
                        <div>
                            <p class="text-sm font-semibold text-highlighted">Role & Status</p>
                            <p class="text-xs text-muted mt-0.5">Define the user's access level and account state</p>
                        </div>
                        <UForm ref="roleForm" :schema="roleSchema" :state="roleData" class="space-y-6"
                            @submit="onRoleSubmit">
                            <UFormField label="Role" name="role">
                                <URadioGroup v-model="roleData.role" :items="roleOptions" class="space-y-2" />
                            </UFormField>

                            <UFormField label="Account Status" name="status">
                                <div class="flex items-center justify-between gap-4 py-2">
                                    <div>
                                        <div class="text-sm font-medium">
                                            {{ roleData.status === 'Active' ? 'Active' : 'Inactive' }}
                                        </div>
                                        <div class="text-xs text-muted">
                                            {{ roleData.status === 'Active'
                                                ? 'User can log in and access assigned pages'
                                                : 'Account is disabled — user cannot log in' }}
                                        </div>
                                    </div>
                                    <USwitch :model-value="roleData.status === 'Active'"
                                        @update:model-value="roleData.status = $event ? 'Active' : 'Inactive'" />
                                </div>
                            </UFormField>
                        </UForm>
                    </div>

                    <!-- Step 2: Review -->
                    <div v-else-if="currentStep === 2" class="space-y-5">
                        <div>
                            <p class="text-sm font-semibold text-highlighted">Review Details</p>
                            <p class="text-xs text-muted mt-0.5">Confirm everything looks correct before creating the
                                user</p>
                        </div>

                        <!-- Preview card -->
                        <div class="flex items-center gap-4 p-4 bg-elevated rounded-xl border border-default">
                            <UAvatar :src="avatarPreview" :alt="personalData.name" size="xl" />
                            <div class="min-w-0 space-y-1.5">
                                <p class="font-bold text-base truncate text-highlighted">{{ personalData.name }}</p>
                                <p class="text-sm text-muted truncate">{{ personalData.email }}</p>
                                <div class="flex items-center gap-2">
                                    <UBadge :label="roleData.role"
                                        :color="roleData.role === 'Admin' ? 'primary' : 'neutral'" variant="soft" />
                                    <StatusBadge :status="roleData.status" />
                                </div>
                            </div>
                        </div>

                        <UAlert icon="i-lucide-info" color="info" variant="soft" title="Ready to submit"
                            description="Clicking 'Create User' will add this record to the system immediately." />
                    </div>

                    <!-- Step 3: Done -->
                    <div v-else class="flex flex-col items-center justify-center py-10 gap-5 text-center">
                        <div class="size-16 rounded-full bg-success/10 flex items-center justify-center">
                            <UIcon name="i-lucide-circle-check" class="size-8 text-success" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-lg font-bold text-highlighted">User Created!</p>
                            <p class="text-sm text-muted">
                                <span class="font-semibold text-default">{{ createdUser?.name }}</span>
                                has been added to the system.
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <UButton label="Add Another" icon="i-lucide-plus" color="neutral" variant="soft"
                                @click="resetWizard" />
                            <UButton label="View Users" trailing-icon="i-lucide-arrow-right" to="/crud" />
                        </div>
                    </div>

                </div>
            </Transition>
        </UCard>

        <!-- ── Navigation controls (hidden on Done step) ── -->
        <div v-if="currentStep < steps.length - 1" class="flex justify-between items-center">
            <UButton label="Back" icon="i-lucide-arrow-left" color="neutral" variant="ghost"
                :disabled="!stepper?.hasPrev" @click="handleBack" />
            <div class="flex items-center gap-3">
                <span class="text-xs text-muted">Step {{ currentStep + 1 }} of {{ steps.length - 1 }}</span>
                <UButton v-if="currentStep < 2" label="Next" trailing-icon="i-lucide-arrow-right"
                    :loading="isSubmitting" @click="handleNext" />
                <UButton v-else label="Create User" icon="i-lucide-check" :loading="isSubmitting" @click="handleNext" />
            </div>
        </div>

    </div>
</template>

<style scoped>
.wizard-slide-enter-active,
.wizard-slide-leave-active {
    transition: all 0.2s ease;
}

.wizard-slide-enter-from {
    opacity: 0;
    transform: translateX(12px);
}

.wizard-slide-leave-to {
    opacity: 0;
    transform: translateX(-12px);
}
</style>
