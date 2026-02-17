import { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { LoadTestReport } from '../../types/api';
import { ReportAnalyzer } from './ReportAnalyzer';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

interface ReportChartProps {
    report: LoadTestReport;
}

export function ReportChart({ report }: ReportChartProps) {
    const data = useMemo(() => {
        if (!report.details || report.details.length === 0) return null;

        const analyzer = new ReportAnalyzer(report.details);

        const startTime = new Date(report.details[0].timestamp).getTime();
        const endTime = new Date(report.details[report.details.length - 1].timestamp).getTime();
        const duration = endTime - startTime;
        let resolution = 1000;
        if (duration > 0) {
            resolution = Math.max(100, Math.ceil(duration / 100));
        }

        const buckets = analyzer.processBuckets(resolution).map((b) => {
            return {
                ...b,
                label: `${(b.timestamp / 1000).toFixed(1)}s`
            };
        });

        const totalErrors = buckets.reduce((sum, b) => sum + b.errorCount, 0);

        const datasets: any[] = [
            {
                type: 'line' as const,
                label: 'RPS',
                data: buckets.map(b => b.rps),
                borderColor: 'rgb(59, 130, 246)', // Blue 500
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                yAxisID: 'y1',
                tension: 0.1,
                pointRadius: 0,
                borderWidth: 1.5,
                order: 2
            },
            {
                type: 'line' as const,
                label: 'Avg Latency',
                data: buckets.map(b => b.avgLatency / 1_000_000),
                borderColor: 'rgb(107, 114, 128)',
                backgroundColor: 'rgba(107, 114, 128, 0.5)',
                yAxisID: 'y',
                borderDash: [5, 5],
                tension: 0.1,
                pointRadius: 0,
                borderWidth: 1,
                order: 3
            },
            {
                type: 'line' as const,
                label: 'p90 Latency',
                data: buckets.map(b => b.p90 / 1_000_000),
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.5)',
                yAxisID: 'y',
                tension: 0.1,
                pointRadius: 0,
                borderWidth: 1,
                order: 4
            },
            {
                type: 'line' as const,
                label: 'p95 Latency',
                data: buckets.map(b => b.p95 / 1_000_000),
                borderColor: 'rgb(234, 179, 8)',
                backgroundColor: 'rgba(234, 179, 8, 0.5)',
                yAxisID: 'y',
                tension: 0.1,
                pointRadius: 0,
                borderWidth: 1,
                order: 5
            },
            {
                type: 'line' as const,
                label: 'p99 Latency',
                data: buckets.map(b => b.p99 / 1_000_000),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                yAxisID: 'y',
                tension: 0.1,
                pointRadius: 0,
                borderWidth: 1,
                order: 6
            }
        ];

        if (totalErrors > 0) {
            datasets.unshift({
                type: 'line' as const,
                label: 'Error Rate (%)',
                // Calculate percentage: (errorCount / totalCount) * 100. If 0 errors, return null to break line.
                data: buckets.map(b => (b.count > 0 && b.errorCount > 0) ? (b.errorCount / b.count) * 100 : null),
                borderColor: 'rgb(239, 68, 68)', // Red 500
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                yAxisID: 'y2',
                tension: 0.1,
                pointRadius: 0, // No dots
                borderWidth: 1.5,
                spanGaps: false,
                order: 1
            });
        }

        return {
            labels: buckets.map(b => b.label),
            datasets: datasets,
            hasErrors: totalErrors > 0
        };
    }, [report]);

    if (!data) return <div className="text-zinc-500 text-xs text-center py-4">No timeline data available</div>;

    const options = {
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: false,
            },
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#a1a1aa', // zinc-400
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                titleColor: '#e4e4e7',
                bodyColor: '#e4e4e7',
                borderColor: '#3f3f46',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (label.includes('Latency')) {
                                label += context.parsed.y.toFixed(2) + ' ms';
                            } else if (label.includes('RPS')) {
                                label += context.parsed.y.toFixed(2) + ' req/s';
                            } else if (label.includes('Error Rate')) {
                                label += context.parsed.y.toFixed(2) + '%';
                            } else {
                                label += context.parsed.y;
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(63, 63, 70, 0.3)',
                },
                ticks: {
                    color: '#a1a1aa',
                    maxTicksLimit: 10
                }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Latency (ms)',
                    color: '#a1a1aa'
                },
                grid: {
                    color: 'rgba(63, 63, 70, 0.3)',
                },
                ticks: {
                    color: '#a1a1aa',
                }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: 'RPS',
                    color: '#3b82f6'
                },
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    color: '#3b82f6',
                }
            },
            y2: {
                type: 'linear' as const,
                display: false, // Hidden as requested
                position: 'right' as const,
                grid: {
                    drawOnChartArea: false,
                },
                min: 0,
                suggestedMax: 10
            },
        },
        animation: {
            duration: 0
        }
    };

    return (
        <div className="w-full h-[400px] bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
            <Chart type='line' options={options} data={data} />
        </div>
    );
}
