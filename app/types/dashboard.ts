// ============================================================================
// Dashboard Types
// ============================================================================

// ── Stat Card ─────────────────────────────────────────────────────────────

export interface StatCardData {
  title: string
  value: string
  icon: string
  trend: string
  trendDirection: 'up' | 'down' | 'flat'
}

// ── Chart Dataset Shapes ───────────────────────────────────────────────────

export interface ChartDataPoint {
  labels: string[]
  datasets: ChartDatasetItem[]
}

export interface ChartDatasetItem {
  label: string
  data: number[]
  borderColor?: string
  backgroundColor?: string | string[]
  hoverBackgroundColor?: string | string[]
  borderWidth?: number
  pointBackgroundColor?: string
  pointBorderColor?: string
  pointBorderWidth?: number
  pointRadius?: number
  pointHoverRadius?: number
  fill?: boolean
  tension?: number
  borderRadius?: number
  maxBarThickness?: number
  hoverOffset?: number
}

// ── Full Dashboard State ───────────────────────────────────────────────────

export interface DashboardData {
  statCards: StatCardData[]
  activityData: ChartDataPoint      // Line: single-series (Active Users)
  revenueData: ChartDataPoint       // Line: multi-series (Revenue vs Expenses)
  completionData: ChartDataPoint    // Bar: single-series (Activity by Category)
  groupedBarData: ChartDataPoint    // Bar: grouped multi-series (Quarterly Performance)
  trafficData: ChartDataPoint       // Doughnut (Traffic Sources)
  polarData: ChartDataPoint         // Polar Area (Resource Allocation)
  radarData: ChartDataPoint         // Radar (System Health)
}
