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

// ============================================================================
// Composables
// ============================================================================
const { palette, legendLabels, defaultOptions, doughnutOptions, polarAreaOptions, radarOptions, lineDataset, barDataset, doughnutDataset, polarAreaDataset, radarDataset } = useChart()

// ── Line: Single series ───────────────────────────────────────────────────
const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [lineDataset({ label: 'Active Users', data: [350, 480, 620, 510, 750, 890, 780] })]
}

// ── Line: Multi-series ────────────────────────────────────────────────────
const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        lineDataset({ label: 'Revenue', data: [4200, 5800, 5100, 7300, 6800, 9100], borderColor: palette.green.solid, backgroundColor: palette.green.soft }),
        lineDataset({ label: 'Expenses', data: [3100, 3900, 4200, 4800, 4100, 5300], borderColor: palette.orange.solid, backgroundColor: palette.orange.soft }),
    ]
}

// ── Bar: Single series ────────────────────────────────────────────────────
const completionData = {
    labels: ['Development', 'Design', 'Marketing', 'Sales', 'Support', 'Operations'],
    datasets: [barDataset({ label: 'Tasks Completed', data: [320, 150, 90, 210, 180, 250] })]
}

// ── Bar: Grouped multi-series ─────────────────────────────────────────────
const groupedBarData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
        barDataset({ label: 'Current Year', data: [540, 720, 890, 1040], backgroundColor: 'rgba(14, 165, 233, 0.85)', hoverBackgroundColor: 'rgb(14, 165, 233)' }),
        barDataset({ label: 'Previous Year', data: [410, 620, 750, 870], backgroundColor: 'rgba(156, 163, 175, 0.35)', hoverBackgroundColor: 'rgba(156, 163, 175, 0.6)' }),
    ]
}

// ── Doughnut ──────────────────────────────────────────────────────────────
const trafficData = {
    labels: ['Direct', 'Organic', 'Referral', 'Social', 'Email'],
    datasets: [doughnutDataset({ label: 'Traffic Sources', data: [38, 27, 15, 12, 8] })]
}

// ── Polar Area ────────────────────────────────────────────────────────────
const polarData = {
    labels: ['Infrastructure', 'Security', 'Performance', 'Availability', 'Compliance', 'Support'],
    datasets: [polarAreaDataset({ label: 'Resource Allocation', data: [72, 58, 89, 95, 63, 44] })]
}

// ── Radar ─────────────────────────────────────────────────────────────────
const radarData = {
    labels: ['Performance', 'Reliability', 'Security', 'Scalability', 'Usability', 'Maintainability'],
    datasets: [
        radarDataset({ label: 'Current', data: [80, 92, 75, 68, 88, 72] }),
        radarDataset({ label: 'Target', data: [90, 95, 90, 85, 92, 88], borderColor: palette.violet.solid, backgroundColor: palette.violet.soft }),
    ]
}
</script>

<template>
    <UPageCard title="Dashboard" description="Key metrics and chart samples for easy reference." variant="naked"
        orientation="horizontal" class="rounded-none" />

    <!-- ── Stat Cards ────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard title="Total Users" value="10,248" icon="i-lucide-users" trend="12% from last month" trendDirection="up" />
        <StatCard title="Active Sessions" value="1,432" icon="i-lucide-activity" trend="5% from last week" trendDirection="up" />
        <StatCard title="Avg. Response Time" value="245ms" icon="i-lucide-zap" trend="12ms from last month" trendDirection="down" />
    </div>

    <!-- ── Row 1: Line Charts ─────────────────────────────────────────── -->
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
                <Line :data="activityData" :options="defaultOptions" />
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
                <Line :data="revenueData"
                    :options="{ ...defaultOptions, plugins: { ...defaultOptions.plugins, legend: { display: true, labels: legendLabels } } }" />
            </div>
        </UCard>
    </div>

    <!-- ── Row 2: Bar Charts ──────────────────────────────────────────── -->
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
                <Bar :data="completionData" :options="defaultOptions" />
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
                <Bar :data="groupedBarData"
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
                <Doughnut :data="trafficData" :options="doughnutOptions" />
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
                <PolarArea :data="polarData" :options="polarAreaOptions" />
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
                <Radar :data="radarData" :options="radarOptions" />
            </div>
        </UCard>
    </div>
</template>
