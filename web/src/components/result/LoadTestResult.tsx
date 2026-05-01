import type { LoadTestReport } from '../../types/api'
import { SummaryPanel } from './SummaryPanel'
import { HistogramChart } from './HistogramChart'
import { ReportChart } from './ReportChart'
import { LatencyDistributionTable, StatusDistributionTable, ErrorDistributionTable, RawJsonCollapsible } from './DistributionTables'

export function LoadTestResult({ report }: { report: LoadTestReport }) {
    return (
        <div className="space-y-6 overflow-y-auto">
            <SummaryPanel report={report} />

            <div>
                <h4 className="text-sm font-bold text-zinc-300 mb-2">Timeline</h4>
                <ReportChart report={report} />
            </div>

            <div>
                <h4 className="text-sm font-bold text-zinc-300 mb-2">Histogram</h4>
                {report.histogram?.length
                    ? <HistogramChart histogram={report.histogram} totalCount={report.count} />
                    : <div className="text-zinc-500 text-xs italic">No histogram data</div>
                }
            </div>

            <LatencyDistributionTable report={report} />
            <StatusDistributionTable report={report} />
            <ErrorDistributionTable report={report} />
            <RawJsonCollapsible report={report} />
        </div>
    )
}
