<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// ============================================================================
// Props, Models & Emits
// ============================================================================
const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{ isEditing: boolean }>()

const emit = defineEmits<{
    save: [data: z.output<typeof schema> & { avatar: string }]
}>()

// ============================================================================
// Schema
// ============================================================================
const schema = z.object({
    name:   z.string().min(1, 'Full name is required'),
    role:   z.string().min(1, 'Job assignment is required'),
    email:  z.string().email('Please enter a valid email address'),
    status: z.enum(['Active', 'Inactive'], { message: 'Please select a status' }),
})

type Schema = z.output<typeof schema>

// ============================================================================
// State
// ============================================================================
const formRef = useTemplateRef('formRef')

const state = reactive<Schema & { avatar: string }>({
    name:   '',
    role:   '',
    email:  '',
    status: 'Active',
    avatar: '',
})

// ============================================================================
// Public API — parent calls these to seed the form before opening
// ============================================================================
const reset = (initial?: Partial<typeof state>) => {
    state.name   = initial?.name   ?? ''
    state.role   = initial?.role   ?? ''
    state.email  = initial?.email  ?? ''
    state.status = initial?.status ?? 'Active'
    state.avatar = initial?.avatar ?? ''
}

defineExpose({ reset })

// ============================================================================
// Handlers
// ============================================================================
async function onSubmit(event: FormSubmitEvent<Schema>) {
    emit('save', { ...event.data, avatar: state.avatar })
}
</script>

<template>
    <UModal v-model:open="open" :title="isEditing ? 'Modify Profile Details' : 'Register New Profile'">
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Full Name" name="name" required>
                    <UInput v-model="state.name" placeholder="John Doe" class="w-full" />
                </UFormField>
                <UFormField label="Job Assignment" name="role" required>
                    <UInput v-model="state.role" placeholder="Systems Engineer" class="w-full" />
                </UFormField>
                <UFormField label="Electronic Mail" name="email" required>
                    <UInput v-model="state.email" type="email" placeholder="john.doe@enterprise.io" class="w-full" />
                </UFormField>
                <UFormField label="Status" name="status" required>
                    <USelect v-model="state.status" :items="['Active', 'Inactive']" class="w-full" />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton variant="ghost" color="neutral" @click="open = false">Dismiss</UButton>
                <UButton color="primary" @click="formRef?.submit()">
                    {{ isEditing ? 'Save Changes' : 'Save Record' }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>