// ============================================================================
// Imports
// ============================================================================
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    BarElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    PolarAreaController,
    CategoryScale,
    LinearScale,
    Filler
} from 'chart.js'

// ============================================================================
// Registration
// ============================================================================

// Register all commonly used Chart.js components globally once
ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    BarElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    PolarAreaController,
    CategoryScale,
    LinearScale,
    Filler
)

// ============================================================================
// Types
// ============================================================================

export interface LineDatasetConfig {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
}

export interface BarDatasetConfig {
    label: string
    data: number[]
    backgroundColor?: string
    hoverBackgroundColor?: string
}

export interface DoughnutDatasetConfig {
    label: string
    data: number[]
    backgroundColor?: string[]
    hoverBackgroundColor?: string[]
}

export interface PolarAreaDatasetConfig {
    label: string
    data: number[]
    backgroundColor?: string[]
}

export interface RadarDatasetConfig {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Chart Composable
 * Provides standardized Chart.js configuration and dataset helpers.
 * Ensures consistent styling across all charts in the application.
 */
export const useChart = () => {

    // -----------------------------------------------------------------------
    // Shared palette for multi-series / doughnut charts
    // -----------------------------------------------------------------------
    const palette = {
        blue:   { solid: 'rgb(14, 165, 233)',   soft: 'rgba(14, 165, 233, 0.15)' },
        violet: { solid: 'rgb(139, 92, 246)',   soft: 'rgba(139, 92, 246, 0.15)' },
        green:  { solid: 'rgb(34, 197, 94)',    soft: 'rgba(34, 197, 94, 0.15)' },
        orange: { solid: 'rgb(249, 115, 22)',   soft: 'rgba(249, 115, 22, 0.15)' },
        pink:   { solid: 'rgb(236, 72, 153)',   soft: 'rgba(236, 72, 153, 0.15)' },
        teal:   { solid: 'rgb(20, 184, 166)',   soft: 'rgba(20, 184, 166, 0.15)' },
    }

    // -----------------------------------------------------------------------
    // Shared legend label style — used across all chart option sets
    // -----------------------------------------------------------------------
    const legendLabels = {
        color: 'rgba(156, 163, 175, 0.9)',
        boxWidth: 12,
        boxHeight: 12,
        padding: 16,
    }

    // -----------------------------------------------------------------------
    // Shared Options
    // -----------------------------------------------------------------------

    /**
     * Default chart options — responsive, no legend, styled tooltip and axes.
     * Pass to `:options` on any <Line> or <Bar> component.
     */
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                border: {
                    color: 'rgba(156, 163, 175, 0.1)'
                },
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(156, 163, 175, 0.8)'
                }
            },
            x: {
                border: {
                    color: 'rgba(156, 163, 175, 0.1)'
                },
                grid: {
                    display: false
                },
                ticks: {
                    color: 'rgba(156, 163, 175, 0.8)'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    }

    /**
     * Options for Doughnut / Pie charts — no axes, legend shown.
     */
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right' as const,
                labels: {
                    ...legendLabels,
                    position: 'right' as const,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 8
            }
        },
    }

    /**
     * Options for Polar Area charts — radial scale, legend shown.
     */
    const polarAreaOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right' as const,
                labels: {
                    ...legendLabels,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 8
            }
        },
        scales: {
            r: {
                grid: { color: 'rgba(156, 163, 175, 0.15)' },
                ticks: { display: false, backdropColor: 'transparent' }
            }
        }
    }

    /**
     * Options for Radar charts — radial axes, no grid lines.
     */
    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    ...legendLabels,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 8
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                grid: { color: 'rgba(156, 163, 175, 0.15)' },
                angleLines: { color: 'rgba(156, 163, 175, 0.15)' },
                pointLabels: { color: 'rgba(156, 163, 175, 0.9)', font: { size: 11 } },
                ticks: { display: false }
            }
        }
    }

    // -----------------------------------------------------------------------
    // Dataset Helpers
    // -----------------------------------------------------------------------

    /**
     * Build a styled line dataset with sensible defaults.
     * @param config - Label, data array, and optional color overrides
     */
    const lineDataset = ({ label, data, borderColor = palette.blue.solid, backgroundColor = palette.blue.soft }: LineDatasetConfig) => ({
        label,
        data,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
    })

    /**
     * Build a styled bar dataset with sensible defaults.
     * @param config - Label, data array, and optional color overrides
     */
    const barDataset = ({ label, data, backgroundColor = 'rgba(139, 92, 246, 0.85)', hoverBackgroundColor = 'rgba(139, 92, 246, 1)' }: BarDatasetConfig) => ({
        label,
        data,
        backgroundColor,
        hoverBackgroundColor,
        borderRadius: 6,
        maxBarThickness: 48
    })

    /**
     * Build a styled doughnut/pie dataset.
     * @param config - Label, data array, and optional color arrays
     */
    const doughnutDataset = ({
        label,
        data,
        backgroundColor = [palette.blue.solid, palette.violet.solid, palette.green.solid, palette.orange.solid, palette.pink.solid, palette.teal.solid],
        hoverBackgroundColor = [palette.blue.solid, palette.violet.solid, palette.green.solid, palette.orange.solid, palette.pink.solid, palette.teal.solid],
    }: DoughnutDatasetConfig) => ({
        label,
        data,
        backgroundColor,
        hoverBackgroundColor,
        borderWidth: 0,
        hoverOffset: 6
    })

    /**
     * Build a styled radar dataset.
     * @param config - Label, data array, and optional color overrides
     */
    const radarDataset = ({ label, data, borderColor = palette.blue.solid, backgroundColor = palette.blue.soft }: RadarDatasetConfig) => ({
        label,
        data,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
    })

    /**
     * Build a styled polar area dataset.
     * @param config - Label, data array, and optional background color array
     */
    const polarAreaDataset = ({
        label,
        data,
        backgroundColor = [
            palette.blue.soft.replace('0.15', '0.7'),
            palette.violet.soft.replace('0.15', '0.7'),
            palette.green.soft.replace('0.15', '0.7'),
            palette.orange.soft.replace('0.15', '0.7'),
            palette.pink.soft.replace('0.15', '0.7'),
            palette.teal.soft.replace('0.15', '0.7'),
        ],
    }: PolarAreaDatasetConfig) => ({
        label,
        data,
        backgroundColor,
        hoverOffset: 6,
        borderWidth: 0,
    })

    return {
        palette,
        legendLabels,
        defaultOptions,
        doughnutOptions,
        polarAreaOptions,
        radarOptions,
        lineDataset,
        barDataset,
        doughnutDataset,
        polarAreaDataset,
        radarDataset,
    }
}
