import { Download } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatNano } from '../../lib/formatters'
import { FormattedOptions } from '../options/FormattedOptions'
import type { LoadTestReport } from '../../types/api'

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
    if (!report.details?.length) return
    const headers = ['timestamp', 'latency_ns', 'status', 'error']
    const rows = report.details.map(d => [d.timestamp, d.latency, d.status, d.error].join(','))
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${new Date().toISOString().slice(0, 19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

const SUMMARY_ROWS = (r: LoadTestReport) => [
    ['Count', String(r.count)],
    ['Total', formatNano(r.total)],
    ['Slowest', formatNano(r.slowest)],
    ['Fastest', formatNano(r.fastest)],
    ['Average', formatNano(r.average)],
    ['Requests / sec', r.rps?.toFixed(2)],
]

export function SummaryPanel({ report }: { report: LoadTestReport }) {
    const hasErrors = report.errorDistribution && Object.keys(report.errorDistribution).length > 0

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-100">Load Test Report</h3>
                <div className="flex items-center gap-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded', hasErrors
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-emerald-500/10 text-emerald-500')}>
                        {hasErrors ? 'Has Errors' : 'Success'}
                    </span>
                    <button onClick={() => exportJSON(report)}
                        className="text-xs text-zinc-500 hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        <Download className="w-3 h-3" /> JSON
                    </button>
                    <button onClick={() => exportCSV(report)} disabled={!report.details?.length}
                        className="text-xs text-zinc-500 hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        <Download className="w-3 h-3" /> CSV
                    </button>
                </div>
            </div>

            {/* Summary + Options */}
            <div className="flex gap-6">
                <div className="shrink-0">
                    <h4 className="text-sm font-bold text-zinc-300 mb-2">Summary</h4>
                    <table className="text-sm border-collapse">
                        <tbody>
                            {SUMMARY_ROWS(report).map(([label, value]) => (
                                <tr key={label} className="border-b border-zinc-800">
                                    <th className="text-left text-zinc-400 pr-6 py-1.5 font-medium">{label}</th>
                                    <td className="text-zinc-200 font-mono py-1.5">{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {report.options && (
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-zinc-300 mb-2">Options</h4>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-3">
                            <FormattedOptions options={report.options} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
