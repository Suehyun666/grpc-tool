import { formatNano } from '../../lib/formatters'
import type { LoadTestReport } from '../../types/api'

export function LatencyDistributionTable({ report }: { report: LoadTestReport }) {
    if (!report.latencyDistribution?.length) return null
    return (
        <div>
            <h4 className="text-sm font-bold text-zinc-300 mb-2">Latency Distribution</h4>
            <div className="overflow-x-auto">
                <table className="text-sm border-collapse">
                    <thead>
                        <tr>
                            {report.latencyDistribution.map(d => (
                                <th key={d.percentage} className="text-zinc-400 font-medium px-4 py-1.5 border-b border-zinc-800">
                                    {d.percentage} %
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {report.latencyDistribution.map(d => (
                                <td key={d.latency} className="text-zinc-200 font-mono px-4 py-1.5">
                                    {formatNano(d.latency)}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function StatusDistributionTable({ report }: { report: LoadTestReport }) {
    if (!report.statusCodeDistribution || !Object.keys(report.statusCodeDistribution).length) return null
    return (
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
    )
}

export function ErrorDistributionTable({ report }: { report: LoadTestReport }) {
    if (!report.errorDistribution || !Object.keys(report.errorDistribution).length) return null
    return (
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
    )
}

export function RawJsonCollapsible({ report }: { report: LoadTestReport }) {
    return (
        <details className="group mt-4">
            <summary className="text-xs font-bold text-zinc-500 cursor-pointer hover:text-zinc-300 list-none flex items-center gap-2">
                <span>Show Raw JSON</span>
            </summary>
            <pre className="text-xs font-mono text-zinc-600 bg-zinc-900/50 p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap mt-2">
                {JSON.stringify(report, null, 2)}
            </pre>
        </details>
    )
}
