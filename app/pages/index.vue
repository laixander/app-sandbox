<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

const store = useUserStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      
      <header class="text-center mb-10">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          NuxtUI Pinia Seeder Demo
        </h1>
        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Generate, destroy, and persist mock data dynamically.
        </p>
      </header>

      <ClientOnly>
        <UCard class="mb-8">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex gap-3">
              <UButton
                icon="i-heroicons-rocket-launch"
                size="md"
                color="primary"
                variant="solid"
                :loading="store.isLoading"
                @click="store.deployMockData(9)"
              >
                Deploy 9 Users
              </UButton>

              <UButton
                icon="i-heroicons-trash"
                size="md"
                color="error"
                variant="ghost"
                :disabled="!store.hasUsers || store.isLoading"
                @click="store.removeMockData()"
              >
                Clear Data
              </UButton>
            </div>

            <div class="flex gap-4 text-sm">
              <div class="flex items-center gap-1.5">
                <span class="text-gray-500">Status:</span>
                <UBadge :color="store.isLoading ? 'warning' : 'success'" variant="subtle">
                  {{ store.isLoading ? 'Seeding...' : 'Ready' }}
                </UBadge>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-gray-500">Total Records:</span>
                <UBadge color="neutral" variant="solid">{{ store.userCount }}</UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <div>
          <div v-if="store.isLoading && !store.hasUsers" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <UCard v-for="n in 9" :key="n" class="w-full">
              <div class="flex items-center space-x-4">
                <USkeleton class="h-12 w-12 rounded-full" />
                <div class="space-y-2 flex-1">
                  <USkeleton class="h-4 w-[60%]" />
                  <USkeleton class="h-4 w-[80%]" />
                </div>
              </div>
            </UCard>
          </div>

          <UCard v-else-if="!store.hasUsers" class="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent">
            <div class="flex flex-col items-center justify-center">
              <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 text-gray-400 mb-4" />
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">No data deployed</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your Pinia state is empty. Click "Deploy" above to run the Faker.js seeder.
              </p>
            </div>
          </UCard>

          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <UCard 
              v-for="user in store.users" 
              :key="user.id" 
              class="transform transition duration-200 hover:scale-[1.02] relative overflow-hidden"
            >
              <div class="flex items-start gap-4">
                <UAvatar :src="user.avatar" :alt="user.name" size="lg" class="bg-gray-200 dark:bg-gray-700" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ user.name }}</p>
                  <p class="text-xs font-medium text-primary-500 truncate mb-2">{{ user.role }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                    <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 inline" />
                    {{ user.email }}
                  </p>
                </div>
              </div>
              <span class="absolute top-2 right-2 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                {{ user.id.slice(0, 8) }}
              </span>
            </UCard>
          </div>
        </div>
        
        <template #fallback>
          <div class="w-full flex flex-col items-center justify-center py-12 text-gray-500">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4" />
            Loading local storage data...
          </div>
        </template>
      </ClientOnly>

    </div>
  </div>
</template>