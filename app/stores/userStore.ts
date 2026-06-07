import { defineStore } from 'pinia'
import { SeederService, type User } from '~/utils/seeder'

export const useUserStore = defineStore('userStore', {
    state: () => ({
        users: [] as User[],
        isLoading: false,
    }),

    actions: {
        deployMockData(count: number = 6) {
            this.isLoading = true
            setTimeout(() => {
                this.users = SeederService.generateUsers(count)
                this.isLoading = false
            }, 500)
        },

        removeMockData() {
            this.isLoading = true
            setTimeout(() => {
                this.users = SeederService.clearUsers()
                this.isLoading = false
            }, 300)
        }
    },

    getters: {
        userCount: (state) => state.users.length,
        hasUsers: (state) => state.users.length > 0
    },

    // Enable persistence to localStorage
    persist: {
        storage: persistedState.localStorage
    }
})