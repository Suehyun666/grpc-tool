import { useState, useEffect } from 'react'
import { Play, Zap, Save } from 'lucide-react'
import type { Test, TestConfig, InvocationResponse, LoadTestReport } from '../../types'
import { api } from '../../api/client'
import { cn } from '../../lib/utils'

interface RequestPanelProps {
    testId: number
}

export function RequestPanel({ testId }: RequestPanelProps) {
    const [test, setTest] = useState<Test | null>(null)
    const [config, setConfig] = useState<TestConfig | null>(null)
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<InvocationResponse | null>(null)
    const [report, setReport] = useState<LoadTestReport | null>(null)
    const [mode, setMode] = useState<'invoke' | 'load'>('invoke')
    const [editorWidth, setEditorWidth] = useState(50) // Percentage

    const [services, setServices] = useState<any[]>([])

    useEffect(() => {
        loadTest(testId)
    }, [testId])

    const generateTemplate = (schema: any): any => {
        if (!schema) return {}
        const res: any = {}
        if (schema.children) {
            for (const field of schema.children) {
                const key = field.jsonName || field.name
                if (field.label === 'repeated') {
                    res[key] = []
                } else if (field.type === 'message') {
                    res[key] = generateTemplate(field)
                } else {
                    switch (field.type) {
                        case 'string': res[key] = ""; break;
                        case 'int32': case 'int64': case 'uint32': case 'uint64': res[key] = 0; break;
                        case 'bool': res[key] = false; break;
                        case 'double': case 'float': res[key] = 0.0; break;
                        default: res[key] = null;
                    }
                }
            }
        }
        return res
    }

    const handleServiceChange = (serviceName: string) => {
        if (!config) return
        const s = services.find(x => x.name === serviceName)
        let method = ""
        let data = "{}"

        if (s && s.methods && s.methods.length > 0) {
            const first = s.methods[0]
            method = typeof first === 'string' ? first : first.name

            // Try to generate template for the first method
            if (typeof first !== 'string' && first.inputSchema) {
                const tmpl = generateTemplate(first.inputSchema)
                data = JSON.stringify(tmpl, null, 2)
            }
        }
        setConfig({ ...config, service: serviceName, method, data })
    }

    const handleMethodChange = (methodName: string) => {
        if (!config) return
        let data = config.data

        // Find schema for this method
        const s = services.find(x => x.name === config.service)
        if (s && s.methods) {
            const m = s.methods.find((x: any) => typeof x !== 'string' && x.name === methodName)
            if (m && m.inputSchema) {
                const tmpl = generateTemplate(m.inputSchema)
                data = JSON.stringify(tmpl, null, 2)
            }
        }
        setConfig({ ...config, method: methodName, data })
    }

    const loadTest = async (id: number) => {
        setLoading(true)
        try {
            const data = await api.getTest(id)
            setTest(data)
            setConfig(data.config || {
                host: 'localhost:50051',
                service: '',
                method: '',
                protoPath: '',
                data: '{}',
                metadata: {},
                insecure: true,
                timeout: 5,
                loadSchedule: 'constant',
                rps: 10,
                duration: '5s'
            })
            setResponse(null)
            setReport(null)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }


    const handleInvoke = async () => {
        if (!config) return
        setLoading(true)
        setResponse(null)
        try {
            const res = await api.invoke(config)
            setResponse(res)
        } catch (err) {
            alert("Invocation Failed")
        } finally {
            setLoading(false)
        }
    }

    const handleLoadTest = async () => {
        if (!config) return
        setLoading(true)
        setReport(null)
        try {
            const res = await api.runLoadTest(config)
            setReport(res)
        } catch (err) {
            alert("Load Test Failed")
        } finally {
            setLoading(false)
        }
    }

    const saveTest = async () => {
        if (!test || !config) return
        setLoading(true)
        try {
            await api.updateTest(test.id, test.name, config)
            alert('Test saved')
        } catch (err) {
            console.error(err)
            alert('Failed to save test')
        } finally {
            setLoading(false)
        }
    }

    if (loading && !test) return <div className="p-4">Loading...</div>
    if (!config) return <div className="p-4">No Config</div>

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-zinc-800 p-2 bg-zinc-900/50">
                <button
                    onClick={() => setMode('invoke')}
                    className={cn("px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2", mode === 'invoke' ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200")}
                >
                    <Play className="w-4 h-4 text-emerald-500" /> Invoke
                </button>
                <button
                    onClick={() => setMode('load')}
                    className={cn("px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2", mode === 'load' ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200")}
                >
                    <Zap className="w-4 h-4 text-amber-500" /> Load Test
                </button>
                <div className="flex-1" />
                <button onClick={saveTest} className="text-zinc-400 hover:text-zinc-100 p-2"><Save className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Area */}
                <div
                    className="p-4 border-r border-zinc-800 overflow-y-auto space-y-4 relative group"
                    style={{ width: `${editorWidth}%` }}
                >

                    {/* Proto Upload */}
                    <div className="space-y-2 p-3 bg-zinc-900/30 rounded border border-zinc-800/50">
                        <label className="text-xs font-medium text-zinc-500 block">Proto File</label>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                accept=".proto"
                                className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:cursor-pointer"
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        setLoading(true)
                                        try {
                                            const res = await api.uploadProto(e.target.files[0])
                                            setConfig(prev => prev ? ({ ...prev, protoPath: res.path }) : null)
                                            setServices(res.services || [])

                                            // Auto-select first service/method if available
                                            if (res.services && res.services.length > 0) {
                                                const s = res.services[0]
                                                // methods can be an array of objects ({name: "..."}) or strings. handle both.
                                                let m = ""
                                                let d = "{}"
                                                if (s.methods && s.methods.length > 0) {
                                                    const first = s.methods[0]
                                                    m = typeof first === 'string' ? first : first.name
                                                    if (typeof first !== 'string' && first.inputSchema) {
                                                        d = JSON.stringify(generateTemplate(first.inputSchema), null, 2)
                                                    }
                                                }
                                                setConfig(prev => prev ? ({ ...prev, service: s.name, method: m, data: d }) : null)
                                            }
                                            alert(`Uploaded ${res.file}`)
                                        } catch (err) {
                                            alert("Upload failed")
                                        } finally {
                                            setLoading(false)
                                        }
                                    }
                                }}
                            />
                        </div>
                        {config.protoPath && <div className="text-xs text-emerald-500 truncate">{config.protoPath}</div>}
                    </div>

                    {/* Service/Method Config */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500">Service / Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {services.length > 0 ? (
                                <select
                                    className="bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-100 placeholder-zinc-600"
                                    value={config.service}
                                    onChange={e => handleServiceChange(e.target.value)}
                                >
                                    <option value="">Select Service</option>
                                    {services.map((s, i) => (
                                        <option key={i} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className="bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-100 placeholder-zinc-600"
                                    placeholder="Service (e.g. package.Service)"
                                    value={config.service}
                                    onChange={e => setConfig({ ...config, service: e.target.value })}
                                />
                            )}

                            {services.length > 0 ? (
                                <select
                                    className="bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-100 placeholder-zinc-600"
                                    value={config.method}
                                    onChange={e => handleMethodChange(e.target.value)}
                                >
                                    <option value="">Select Method</option>
                                    {(() => {
                                        const s = services.find(x => x.name === config.service)
                                        if (!s || !s.methods) return null
                                        return s.methods.map((m: any, i: number) => {
                                            const name = typeof m === 'string' ? m : m.name
                                            return <option key={i} value={name}>{name}</option>
                                        })
                                    })()}
                                </select>
                            ) : (
                                <input
                                    className="bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-100 placeholder-zinc-600"
                                    placeholder="Method"
                                    value={config.method}
                                    onChange={e => setConfig({ ...config, method: e.target.value })}
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500">Target Host</label>
                        <input
                            className="bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-100 w-full"
                            placeholder="localhost:50051"
                            value={config.host}
                            onChange={e => setConfig({ ...config, host: e.target.value })}
                        />
                    </div>

                    {mode === 'load' && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-900/30 rounded border border-zinc-800/50">
                            <div>
                                <label className="text-xs text-zinc-500">RPS</label>
                                <input type="number" value={config.rps} onChange={e => setConfig({ ...config, rps: parseInt(e.target.value) })} className="w-full bg-zinc-900 border border-zinc-700 rounded p-1 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500">Duration</label>
                                <input value={config.duration} onChange={e => setConfig({ ...config, duration: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded p-1 text-sm" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-xs font-medium text-zinc-500">Request Data (JSON)</label>
                        <textarea
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm font-mono text-zinc-300 min-h-[200px]"
                            value={config.data}
                            onChange={e => setConfig({ ...config, data: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={mode === 'invoke' ? handleInvoke : handleLoadTest}
                        disabled={loading}
                        className={cn("w-full py-2 rounded font-medium transition-colors",
                            mode === 'invoke' ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-amber-600 hover:bg-amber-500 text-white",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loading ? 'Running...' : (mode === 'invoke' ? 'Send Request' : 'Start Load Test')}
                    </button>

                    {/* Resizer */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500/50 transition-colors z-10"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            // Simpler approach: calculate width based on mouse X position relative to container
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                const container = e.currentTarget.parentElement?.parentElement
                                if (container) {
                                    const rect = container.getBoundingClientRect()
                                    const x = moveEvent.clientX - rect.left
                                    const newPercent = (x / rect.width) * 100
                                    if (newPercent > 20 && newPercent < 80) setEditorWidth(newPercent)
                                }
                            }

                            const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove)
                                document.removeEventListener('mouseup', handleMouseUp)
                            }

                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                        }}
                    />
                </div>


                {/* Response Area */}
                <div
                    className="p-4 overflow-y-auto bg-zinc-950 flex flex-col"
                    style={{ width: `${100 - editorWidth}%` }}
                >
                    {!response && !report && <div className="text-zinc-600 text-center mt-20">No response yet</div>}

                    {response && (
                        <div className="space-y-4 flex-1 flex flex-col min-h-0">
                            <div className="flex items-center gap-4 border-b border-zinc-800 pb-2 flex-wrap">
                                <div className={cn("px-2 py-1 rounded text-xs font-bold", response.status === 'OK' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                    {response.statusCode} ({response.grpcCode})
                                </div>
                                <div className="text-xs text-zinc-400">HTTP: {response.httpCode}</div>
                                <div className="text-xs text-zinc-400">
                                    Time: {response.timeNs < 1000000 ? `${(response.timeNs / 1000).toFixed(2)}µs` : `${(response.timeNs / 1000000).toFixed(2)}ms`}
                                </div>
                                <div className="text-xs text-zinc-400">Size: {response.dataSize}B</div>
                            </div>

                            <div className="flex-1 overflow-auto space-y-2">
                                {/* Headers */}
                                {response.headers && Object.keys(response.headers).length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-zinc-500 mb-1">Headers</div>
                                        <div className="bg-zinc-900 rounded p-2 text-xs font-mono text-zinc-400">
                                            {Object.entries(response.headers).map(([k, v]) => (
                                                <div key={k}><span className="text-zinc-500">{k}:</span> {v}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Body */}
                                <div>
                                    <div className="text-xs font-bold text-zinc-500 mb-1">Body</div>
                                    <pre className="text-sm font-mono text-zinc-300 overflow-auto whitespace-pre-wrap">
                                        {JSON.stringify(response.body, null, 2)}
                                    </pre>
                                </div>

                                {response.error && (
                                    <div className="text-red-400 text-sm mt-2 font-mono bg-red-900/10 p-2 rounded">
                                        Error: {response.error}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {report && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-zinc-100">Load Test Report</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Stat label="Total Requests" value={report.count} />
                                <Stat label="RPS" value={report.rps.toFixed(2)} />
                                <Stat label="Avg Latency" value={report.avgLatency + 'ms'} />
                            </div>
                            <pre className="text-xs font-mono text-zinc-500 mt-4 overflow-auto">
                                {JSON.stringify(report, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
            <div className="text-zinc-500 text-xs">{label}</div>
            <div className="text-xl font-bold text-zinc-200">{value}</div>
        </div>
    )
}
