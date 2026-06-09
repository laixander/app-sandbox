import { defineStore } from 'pinia'
import { SeederService } from '~/utils/seeder'
import type { DashboardData } from '~/types/dashboard'

// ── Default empty state ────────────────────────────────────────────────────
const getEmptyState = (): DashboardData => SeederService.clearDashboard()

export const useDashboardStore = defineStore('dashboardStore', {
    state: () => ({
        ...getEmptyState(),
        isLoading: false,
    }),

    actions: {
        deployMockData() {
            this.isLoading = true
            setTimeout(() => {
                const data = SeederService.generateDashboard()
                this.statCards     = data.statCards
                this.activityData  = data.activityData
                this.revenueData   = data.revenueData
                this.completionData = data.completionData
                this.groupedBarData = data.groupedBarData
                this.trafficData   = data.trafficData
                this.polarData     = data.polarData
                this.radarData     = data.radarData
                this.isLoading = false
            }, 500)
        },

        removeMockData() {
            this.isLoading = true
            setTimeout(() => {
                const empty = getEmptyState()
                this.statCards     = empty.statCards
                this.activityData  = empty.activityData
                this.revenueData   = empty.revenueData
                this.completionData = empty.completionData
                this.groupedBarData = empty.groupedBarData
                this.trafficData   = empty.trafficData
                this.polarData     = empty.polarData
                this.radarData     = empty.radarData
                this.isLoading = false
            }, 300)
        },
    },

    getters: {
        hasDashboardData: (state) => state.statCards.some(c => c.value !== '—'),
    },

    persist: {
        storage: persistedState.localStorage
    }
})
