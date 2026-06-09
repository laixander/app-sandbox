<script setup lang="ts">
import type { NuxtError } from '#app'

// ============================================================================
// Error Page
// ============================================================================
// Nuxt 3's global error boundary — rendered for ALL unhandled errors
// (404, 500, middleware errors, etc.). Does not use any layout.
//
// UError handles all rendering: status code, message, and clear button.
// clearError() is called internally by UError when the button is clicked.
// The auth middleware will redirect to /login if the user is not authenticated
// after clearError({ redirect: '/' }) fires.

const props = defineProps<{
    error: NuxtError
}>()
</script>

<template>
    <UApp>
        <UError :error="error" redirect="/">
            <template #leading>
                <div class="flex items-center justify-center gap-1.5 mb-2">
                    <UIcon name="i-ph-codesandbox-logo-duotone" class="size-7 text-primary" />
                    <span class="text-base font-black tracking-tight">
                        Sand<span class="text-primary">Box</span>
                    </span>
                </div>
            </template>
        </UError>
    </UApp>
</template>
