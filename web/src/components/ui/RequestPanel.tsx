import { useEffect } from 'react'
import { Play, Save, Send } from 'lucide-react'
import { useRequestLogic } from '../../hooks/useRequestLogic'
import { LoadOptions } from '../options/LoadOptions'
import { AdvancedOptions } from '../options/AdvancedOptions'
import { ProtoForm } from './ProtoForm'
import type { InvokeResult, LoadTestReport } from '../../types/api'

interface RequestPanelProps {
    testId?: number | null
    onReport?: (report: LoadTestReport | null) => void
    onInvokeResult?: (result: InvokeResult | null) => void
}

export function RequestPanel({ testId, onReport, onInvokeResult }: RequestPanelProps) {
    const {
        config, setConfig,
        report, invokeResult,
        loading, invokeLoading,
        services, methods,
        inputSchema,
        protoFile,
        handleProtoUpload,
        handleServiceChange,
        handleMethodChange,
        handleSend,
        handleInvoke
    } = useRequestLogic(testId)

    useEffect(() => { onReport?.(report) }, [report])
    useEffect(() => { onInvokeResult?.(invokeResult) }, [invokeResult])

    const labelCls = "text-xs font-bold text-zinc-500 block mb-1.5"
    const inputCls = "bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-sm text-zinc-200 w-full focus:outline-none focus:border-emerald-500/50"

    return (
        <div className="h-full flex flex-col bg-zinc-950">
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
                <span className="text-sm font-bold text-zinc-200">Request</span>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200 select-none">
                        <input
                            type="checkbox"
                            checked={config.insecure}
                            onChange={e => setConfig({ ...config, insecure: e.target.checked })}
                            className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500/20"
                        />
                        Insecure
                    </label>
                    <button className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors">
                        <Save className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {/* Proto File */}
                    <div>
                        <label className={labelCls}>Proto File</label>
                        <input type="file" onChange={handleProtoUpload} className="hidden" id="proto-upload" />
                        <label
                            htmlFor="proto-upload"
                            className="inline-block px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded cursor-pointer transition-colors border border-zinc-700"
                        >
                            Browse...
                        </label>
                        <span className="ml-2 text-xs text-zinc-500 truncate max-w-[200px] inline-block align-middle">
                            {protoFile ? protoFile.split('/').pop() : 'No file selected.'}
                        </span>
                        {protoFile && <div className="text-[10px] text-emerald-500/70 mt-1 truncate">{protoFile}</div>}
                    </div>

                    {/* Service & Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Service</label>
                            <select
                                value={config.service}
                                onChange={e => handleServiceChange(e.target.value)}
                                className={inputCls}
                                disabled={services.length === 0}
                            >
                                {services.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Method</label>
                            <select
                                value={config.method}
                                onChange={e => handleMethodChange(e.target.value)}
                                className={inputCls}
                                disabled={methods.length === 0}
                            >
                                {methods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Target Host */}
                    <div>
                        <label className={labelCls}>Target Host</label>
                        <input
                            value={config.host}
                            onChange={e => setConfig({ ...config, host: e.target.value })}
                            className={inputCls}
                            placeholder="localhost:50051"
                        />
                    </div>

                    {/* Request Data - ProtoForm */}
                    <div>
                        <label className="text-xs font-bold text-zinc-300 block mb-1.5">Request Data</label>
                        <ProtoForm
                            schema={inputSchema}
                            value={config.data}
                            onChange={data => setConfig({ ...config, data })}
                        />
                    </div>

                    {/* Load Options */}
                    <LoadOptions config={config} onChange={setConfig} />

                    {/* Advanced Options */}
                    <AdvancedOptions config={config} onChange={setConfig} />
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-800 shrink-0 bg-zinc-950/95 backdrop-blur flex gap-2">
                <button
                    onClick={handleInvoke}
                    disabled={invokeLoading || loading || !config.protoPath}
                    className={`
                        flex-1 flex items-center justify-center gap-2 py-2 rounded font-bold transition-all text-sm
                        ${invokeLoading
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                        }
                    `}
                >
                    {invokeLoading ? (
                        <span className="animate-pulse">Sending...</span>
                    ) : (
                        <>
                            <Send className="w-3.5 h-3.5" />
                            Send
                        </>
                    )}
                </button>
                <button
                    onClick={handleSend}
                    disabled={loading || invokeLoading || !config.protoPath}
                    className={`
                        flex-1 flex items-center justify-center gap-2 py-2 rounded font-bold transition-all text-sm
                        ${loading
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                        }
                    `}
                >
                    {loading ? (
                        <span className="animate-pulse">Running...</span>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" />
                            Run Test
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
