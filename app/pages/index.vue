<script setup lang="ts">
// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Dashboard'
})

// ============================================================================
// Imports
// ============================================================================
import { Line, Bar, Doughnut, Radar, PolarArea } from 'vue-chartjs'
import { useDashboardStore } from '~/stores/dashboardStore'

// ============================================================================
// Store
// ============================================================================
const dashboardStore = useDashboardStore()

// ============================================================================
// Chart Options (from composable — options only, data comes from the store)
// ============================================================================
const { legendLabels, defaultOptions, doughnutOptions, polarAreaOptions, radarOptions } = useChart()
</script>

<template>
    <PageHeading title="Dashboard" description="Key metrics and chart samples for easy reference." />
    <ClientOnly>
        <!-- ── Stat Cards ────────────────────────────────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <StatCard v-for="card in dashboardStore.statCards" :key="card.title" :title="card.title" :value="card.value"
                :icon="card.icon" :trend="card.trend" :trend-direction="card.trendDirection" />
        </div>

        <!-- ── Row 1: Line Charts ─────────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-base font-semibold">Active Users Trend</h3>
                        <p class="text-xs text-muted mt-0.5">Single-series line chart</p>
                    </div>
                    <UBadge variant="soft" color="primary">Weekly</UBadge>
                </div>
                <div class="h-[240px] w-full">
                    <Line :data="dashboardStore.activityData" :options="defaultOptions" />
                </div>
            </UCard>
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-base font-semibold">Revenue vs Expenses</h3>
                        <p class="text-xs text-muted mt-0.5">Multi-series line chart</p>
                    </div>
                    <UBadge variant="soft" color="primary">6 Months</UBadge>
                </div>
                <div class="h-[240px] w-full">
                    <Line :data="dashboardStore.revenueData"
                        :options="{ ...defaultOptions, plugins: { ...defaultOptions.plugins, legend: { display: true, labels: legendLabels } } }" />
                </div>
            </UCard>
        </div>

        <!-- ── Row 2: Bar Charts ──────────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-base font-semibold">Activity by Category</h3>
                        <p class="text-xs text-muted mt-0.5">Single-series bar chart</p>
                    </div>
                    <UBadge variant="soft" color="primary">All Time</UBadge>
                </div>
                <div class="h-[240px] w-full">
                    <Bar :data="dashboardStore.completionData" :options="defaultOptions" />
                </div>
            </UCard>
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-base font-semibold">Quarterly Performance</h3>
                        <p class="text-xs text-muted mt-0.5">Grouped bar chart</p>
                    </div>
                    <UBadge variant="soft" color="primary">YoY</UBadge>
                </div>
                <div class="h-[240px] w-full">
                    <Bar :data="dashboardStore.groupedBarData"
                        :options="{ ...defaultOptions, plugins: { ...defaultOptions.plugins, legend: { display: true, labels: legendLabels } } }" />
                </div>
            </UCard>
        </div>

        <!-- ── Row 3: Doughnut + Polar Area + Radar ──────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-base font-semibold">Traffic Sources</h3>
                        <p class="text-xs text-muted mt-0.5">Doughnut chart</p>
                    </div>
                    <UBadge variant="soft" color="primary">This Month</UBadge>
                </div>
                <div class="h-[240px] w-full">
                    <Doughnut :data="dashboardStore.trafficData" :options="doughnutOptions" />
                </div>
            </UCard>
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-base font-semibold">Resource Allocation</h3>
                        <p class="text-xs text-muted mt-0.5">Polar area chart</p>
                    </div>
                    <UBadge variant="soft" color="primary">Current Quarter</UBadge>
                </div>
                <div class="h-[240px] w-full">
                    <PolarArea :data="dashboardStore.polarData" :options="polarAreaOptions" />
                </div>
            </UCard>
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-base font-semibold">System Health</h3>
                        <p class="text-xs text-muted mt-0.5">Radar chart</p>
                    </div>
                    <UBadge variant="soft" color="primary">vs Target</UBadge>
                </div>
                <div class="h-[240px] w-full">
                    <Radar :data="dashboardStore.radarData" :options="radarOptions" />
                </div>
            </UCard>
        </div>
    </ClientOnly>
</template>
