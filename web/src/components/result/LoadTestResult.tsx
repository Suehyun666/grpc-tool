import { cn } from '../../lib/utils'
import type { LoadTestReport } from '../../types/api'
import { FormattedOptions } from '../options/FormattedOptions'
import { HistogramChart } from './HistogramChart'
import { ReportChart } from './ReportChart'
import { Download } from 'lucide-react'

function formatNano(ns: number): string {
    if (ns >= 1_000_000_000) return `${(ns / 1_000_000_000).toFixed(2)} s`
    if (ns >= 1_000_000) return `${(ns / 1_000_000).toFixed(2)} ms`
    if (ns >= 1_000) return `${(ns / 1_000).toFixed(2)} us`
    return `${ns} ns`
}

function exportJSON(report: LoadTestReport) {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
}

function exportCSV(report: LoadTestReport) {
    if (!report.details || report.details.length === 0) return
    const headers = ['timestamp', 'latency_ns', 'status', 'error']
    const rows = report.details.map(d => [d.timestamp, d.latency, d.status, d.error].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${new Date().toISOString().slice(0, 19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export function LoadTestResult({ report }: { report: LoadTestReport }) {
    return (
        <div className="space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-100">Load Test Report</h3>
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded", report.errorDistribution && Object.keys(report.errorDistribution).length > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                        {report.errorDistribution && Object.keys(report.errorDistribution).length > 0 ? "Has Errors" : "Success"}
                    </span>
                    <button
                        onClick={() => exportJSON(report)}
                        className="text-xs text-zinc-500 hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                        title="Export JSON"
                    >
                        <Download className="w-3 h-3" /> JSON
                    </button>
                    <button
                        onClick={() => exportCSV(report)}
                        className="text-xs text-zinc-500 hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                        title="Export CSV"
                        disabled={!report.details?.length}
                    >
                        <Download className="w-3 h-3" /> CSV
                    </button>
                </div>
            </div>

            {/* Summary + Options row */}
            <div className="flex gap-6">
                {/* Summary Table */}
                <div className="shrink-0">
                    <h4 className="text-sm font-bold text-zinc-300 mb-2">Summary</h4>
                    <table className="text-sm border-collapse">
                        <tbody>
                            {[
                                ['Count', String(report.count)],
                                ['Total', formatNano(report.total)],
                                ['Slowest', formatNano(report.slowest)],
                                ['Fastest', formatNano(report.fastest)],
                                ['Average', formatNano(report.average)],
                                ['Requests / sec', report.rps?.toFixed(2)],
                            ].map(([label, value]) => (
                                <tr key={label} className="border-b border-zinc-800">
                                    <th className="text-left text-zinc-400 pr-6 py-1.5 font-medium">{label}</th>
                                    <td className="text-zinc-200 font-mono py-1.5">{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Options */}
                {report.options && (
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-zinc-300 mb-2">Options</h4>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-3">
                            <FormattedOptions options={report.options} />
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div>
                <h4 className="text-sm font-bold text-zinc-300 mb-2">Timeline</h4>
                <ReportChart report={report} />
            </div>

            {/* Histogram */}
            <div>
                <h4 className="text-sm font-bold text-zinc-300 mb-2">Histogram</h4>
                {report.histogram && report.histogram.length > 0 ? (
                    <HistogramChart histogram={report.histogram} totalCount={report.count} />
                ) : (
                    <div className="text-zinc-500 text-xs italic">No histogram data</div>
                )}
            </div>

            {/* Latency Distribution */}
            {report.latencyDistribution && report.latencyDistribution.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-zinc-300 mb-2">Latency Distribution</h4>
                    <div className="overflow-x-auto">
                        <table className="text-sm border-collapse">
                            <thead>
                                <tr>
                                    {report.latencyDistribution.map((dist) => (
                                        <th key={dist.percentage} className="text-zinc-400 font-medium px-4 py-1.5 border-b border-zinc-800">
                                            {dist.percentage} %
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {report.latencyDistribution.map((dist) => (
                                        <td key={dist.latency} className="text-zinc-200 font-mono px-4 py-1.5">
                                            {formatNano(dist.latency)}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Status Code Distribution */}
            {report.statusCodeDistribution && Object.keys(report.statusCodeDistribution).length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-zinc-300 mb-2">Status Distribution</h4>
                    <table className="text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-700">
                                <th className="text-left text-zinc-400 font-medium pr-6 py-1.5">Status</th>
                                <th className="text-left text-zinc-400 font-medium pr-6 py-1.5">Count</th>
                                <th className="text-left text-zinc-400 font-medium py-1.5">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(report.statusCodeDistribution).map(([status, count]) => (
                                <tr key={status} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                                    <td className="text-zinc-200 pr-6 py-1.5">{status}</td>
                                    <td className="text-zinc-200 font-mono pr-6 py-1.5">{count}</td>
                                    <td className="text-zinc-200 font-mono py-1.5">{(count / report.count * 100).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Error Distribution */}
            {report.errorDistribution && Object.keys(report.errorDistribution).length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-zinc-300 mb-2">Errors</h4>
                    <table className="text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-700">
                                <th className="text-left text-zinc-400 font-medium pr-6 py-1.5">Error</th>
                                <th className="text-left text-zinc-400 font-medium pr-6 py-1.5">Count</th>
                                <th className="text-left text-zinc-400 font-medium py-1.5">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(report.errorDistribution).map(([err, count]) => (
                                <tr key={err} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                                    <td className="text-red-400 pr-6 py-1.5 max-w-md truncate" title={err}>{err}</td>
                                    <td className="text-zinc-200 font-mono pr-6 py-1.5">{count}</td>
                                    <td className="text-zinc-200 font-mono py-1.5">{(count / report.count * 100).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Raw JSON */}
            <div className="mt-4">
                <details className="group">
                    <summary className="text-xs font-bold text-zinc-500 cursor-pointer hover:text-zinc-300 list-none flex items-center gap-2">
                        <span>Show Raw JSON</span>
                    </summary>
                    <pre className="text-xs font-mono text-zinc-600 bg-zinc-900/50 p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap mt-2">
                        {JSON.stringify(report, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    )
}
