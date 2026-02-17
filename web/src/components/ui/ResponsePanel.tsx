import type { LoadTestReport } from '../../types/api'
import { LoadTestResult } from '../result/LoadTestResult'

interface ResponsePanelProps {
    report: LoadTestReport | null
}

export function ResponsePanel({ report }: ResponsePanelProps) {
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-12 flex items-center px-4 border-b border-zinc-800 shrink-0">
                <span className="text-sm font-bold text-zinc-200">Response</span>
            </div>

            {/* Content */}
            {report ? (
                <div className="flex-1 overflow-y-auto p-4">
                    <LoadTestResult report={report} />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
                    Run a test to see results
                </div>
            )}
        </div>
    )
}
