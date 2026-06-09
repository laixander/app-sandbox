<script setup lang="ts">
import type { SystemRole } from '~/types/auth'

definePageMeta({
    layout: false
})

const { setRole } = useDemoAuth()
const router = useRouter()

const selectedRole = ref<SystemRole | undefined>(undefined)

const roleOptions: { label: string; value: SystemRole; description: string; icon: string }[] = [
    {
        label: 'Admin',
        value: 'Admin',
        description: 'Full access to all pages and features',
        icon: 'i-lucide-shield-check'
    },
    {
        label: 'Staff',
        value: 'Staff',
        description: 'Access to basic pages',
        icon: 'i-lucide-user-round'
    },
]

const handleLogin = () => {
    if (!selectedRole.value) return
    setRole(selectedRole.value)

    if (selectedRole.value === 'Admin') {
        router.push('/')
    } else {
        router.push('/crud')
    }
}
</script>

<template>
    <div class="fixed inset-0 flex justify-center items-center bg-neutral-50 dark:bg-neutral-950">
        <UCard class="w-full max-w-sm shadow-sm">
            <header class="space-y-3 text-center">
                <div class="flex items-center justify-center gap-2">
                    <UIcon name="i-ph-codesandbox-logo-duotone" class="size-8 text-primary" />
                    <span class="text-2xl font-black tracking-tight">Sand<span class="text-primary">Box</span></span>
                </div>
                <div class="text-sm text-muted">Sign in to your account to continue</div>
            </header>

            <USeparator class="my-6" />

            <main class="space-y-4">
                <UFormField label="Username">
                    <UInput placeholder="Enter your username" variant="soft" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="Password">
                    <UInput placeholder="Enter your password" variant="soft" size="lg" type="password" class="w-full" />
                </UFormField>
                <UFormField label="Role">
                    <USelect v-model="selectedRole" placeholder="Select your role"
                        :items="roleOptions.map(r => ({ label: r.label, value: r.value }))" variant="soft" size="lg"
                        class="w-full" />
                </UFormField>

                <!-- Role preview card -->
                <Transition name="fade" mode="out-in">
                    <div v-if="selectedRole"
                        class="flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800">
                        <UIcon :name="roleOptions.find(r => r.value === selectedRole)?.icon || 'i-lucide-user'"
                            class="size-5 text-primary shrink-0" />
                        <div>
                            <div class="text-sm font-semibold text-primary">{{ selectedRole }}</div>
                            <div class="text-xs text-muted">
                                {{roleOptions.find(r => r.value === selectedRole)?.description}}
                            </div>
                        </div>
                    </div>
                </Transition>

                <UButton label="Sign In" size="lg" class="justify-center" block :disabled="!selectedRole"
                    @click="handleLogin" />
            </main>

            <footer class="text-center mt-8">
                <ULink as="button" class="text-sm">Forgot Password?</ULink>
            </footer>
        </UCard>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
