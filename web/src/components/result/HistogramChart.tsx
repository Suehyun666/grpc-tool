
import { useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { LoadTestReport } from '../../types/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export function HistogramChart({ histogram, totalCount }: { histogram: LoadTestReport['histogram'], totalCount: number }) {
    const chartRef = useRef<any>(null)

    // Labels: latency in ms (mark is in seconds)
    const labels = histogram.map(h => (h.mark * 1000).toFixed(2))
    const counts = histogram.map(h => h.count)

    const data = {
        labels,
        datasets: [
            {
                label: 'Count',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
            },
        ],
    }

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest' as const,
            axis: 'y' as const,
            intersect: true,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: (items: any[]) => {
                        const value = parseInt(items[0].formattedValue)
                        const percent = (value / totalCount * 100).toFixed(1)
                        return `${value} (${percent} %)`
                    },
                },
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Count', color: '#a1a1aa' },
                ticks: { color: '#71717a' },
                grid: { color: '#27272a' },
            },
            y: {
                title: { display: true, text: 'Latency (ms)', color: '#a1a1aa' },
                ticks: { color: '#71717a' },
                grid: { color: '#27272a' },
            },
        },
    }

    const height = Math.max(200, histogram.length * 30)

    return (
        <div style={{ height: `${height}px` }}>
            <Bar ref={chartRef} data={data} options={options} />
        </div>
    )
}
