import { useState } from 'react'
import type { InvokeResult, LoadTestReport } from '../../types/api'
import { LoadTestResult } from '../result/LoadTestResult'
import { cn } from '../../lib/utils'

interface ResponsePanelProps {
    report: LoadTestReport | null
    invokeResult: InvokeResult | null
}

export function ResponsePanel({ report, invokeResult }: ResponsePanelProps) {
    const [tab, setTab] = useState<'response' | 'loadtest'>('response')

    return (
        <div className="h-full flex flex-col">
            {/* Header with tabs */}
            <div className="h-12 flex items-center border-b border-zinc-800 shrink-0 px-2 gap-1">
                <button
                    onClick={() => setTab('response')}
                    className={cn(
                        "px-3 py-1.5 text-sm font-bold rounded transition-colors",
                        tab === 'response'
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    Response
                    {invokeResult && (
                        <span className={cn(
                            "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
                            invokeResult.error
                                ? "bg-red-500/20 text-red-400"
                                : "bg-emerald-500/20 text-emerald-400"
                        )}>
                            {invokeResult.error ? 'ERR' : 'OK'}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab('loadtest')}
                    className={cn(
                        "px-3 py-1.5 text-sm font-bold rounded transition-colors",
                        tab === 'loadtest'
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    Load Test
                    {report && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-400">
                            {report.count}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {tab === 'response' && (
                    invokeResult ? (
                        <div className="p-4">
                            {invokeResult.error ? (
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-red-400">Error</span>
                                    <pre className="text-sm font-mono text-red-300 bg-red-500/5 border border-red-500/20 rounded p-3 whitespace-pre-wrap break-all">
                                        {invokeResult.error}
                                    </pre>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-emerald-400">200 OK</span>
                                    <pre className="text-sm font-mono text-zinc-200 bg-zinc-900 border border-zinc-800 rounded p-3 whitespace-pre-wrap break-all">
                                        {JSON.stringify(invokeResult.response, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center h-full text-zinc-600 text-sm">
                            Press Send to invoke
                        </div>
                    )
                )}

                {tab === 'loadtest' && (
                    report ? (
                        <div className="p-4">
                            <LoadTestResult report={report} />
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center h-full text-zinc-600 text-sm">
                            Run a test to see results
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
