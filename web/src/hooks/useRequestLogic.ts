import { useState, useEffect, useMemo } from 'react'
import { api } from '../lib/api'
import type { FieldDesc, LoadTestReport, ServiceDesc, TestConfig } from '../types'
import type { InvokeResult } from '../types/api'
import { generateTemplate } from '../lib/protoUtils'

const DEFAULT_CONFIG_VAL: TestConfig = {
    protoPath: '',
    service: '',
    method: '',
    host: 'localhost:8080',
    data: '{}',
    metadata: {},
    insecure: true,
    totalRequests: 200,
    concurrency: 50,
    rps: 0,
    duration: '',
    connections: 1,
    timeout: 0,
    dialTimeout: 0,
    cpus: 0,
    loadStart: 0,
    loadEnd: 0,
    loadStep: 0,
    loadStepDuration: '',
    loadSchedule: '',
    concurrencySchedule: '',
    concurrencyStart: 0,
    concurrencyEnd: 0,
    concurrencyStep: 0,
    concurrencyStepDuration: ''
}

export function useRequestLogic(testId?: number | null) {
    const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG_VAL)
    const [report, setReport] = useState<LoadTestReport | null>(null)
    const [invokeResult, setInvokeResult] = useState<InvokeResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [invokeLoading, setInvokeLoading] = useState(false)

    // Store full service definitions
    const [serviceDefs, setServiceDefs] = useState<ServiceDesc[]>([])
    const [services, setServices] = useState<string[]>([])
    const [methods, setMethods] = useState<string[]>([])
    const [protoFile, setProtoFile] = useState<string | null>(null)

    // Reset everything when testId changes
    useEffect(() => {
        setConfig(DEFAULT_CONFIG_VAL)
        setReport(null)
        setInvokeResult(null)
        setServices([])
        setMethods([])
        setServiceDefs([])
        setProtoFile(null)

        if (testId) {
            loadTest(testId)
        }
    }, [testId])

    const loadTest = async (id: number) => {
        try {
            setLoading(true)
            const test = await api.getTest(id)
            if (test && test.config) {
                setConfig({ ...DEFAULT_CONFIG_VAL, ...test.config })
            }
        } catch (err) {
            console.error("Failed to load test", err)
        } finally {
            setLoading(false)
        }
    }

    const handleProtoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const res = await api.uploadProto(formData)
            setProtoFile(res.path)
            setConfig(prev => ({ ...prev, protoPath: res.path }))

            setServiceDefs(res.services)
            const srvNames = res.services.map(s => s.name)
            setServices(srvNames)

            if (srvNames.length > 0) {
                const firstSvc = srvNames[0]
                setConfig(prev => ({ ...prev, service: firstSvc }))
                loadMethods(res.services, firstSvc)
            } else {
                setMethods([])
            }
        } catch (err) {
            console.error(err)
            alert("Proto upload failed")
        } finally {
            setLoading(false)
        }
    }

    const loadMethods = (defs: ServiceDesc[], serviceName: string) => {
        const desc = defs.find(s => s.name === serviceName)
        if (!desc) {
            setMethods([])
            return
        }

        const mnames = desc.methods.map((m: any) => typeof m === 'string' ? m : m.name)
        setMethods(mnames)

        if (mnames.length > 0) {
            const firstMethod = mnames[0]
            setConfig(prev => ({ ...prev, method: firstMethod }))
            const tpl = generateTemplate(defs, serviceName, firstMethod)
            setConfig(prev => ({ ...prev, data: tpl }))
        }
    }

    const handleServiceChange = (svc: string) => {
        setConfig(prev => ({ ...prev, service: svc }))
        loadMethods(serviceDefs, svc)
    }

    const handleMethodChange = (methodName: string) => {
        setConfig(prev => ({ ...prev, method: methodName }))
        const tpl = generateTemplate(serviceDefs, config.service, methodName)
        setConfig(prev => ({ ...prev, data: tpl }))
    }

    // Get the input schema for the currently selected method
    const inputSchema: FieldDesc | null = useMemo(() => {
        if (!serviceDefs.length || !config.service || !config.method) return null
        const svc = serviceDefs.find(s => s.name === config.service)
        if (!svc) return null
        const method = svc.methods.find((m: any) => (typeof m === 'string' ? m : m.name) === config.method)
        if (!method || typeof method === 'string') return null
        return method.inputSchema || null
    }, [serviceDefs, config.service, config.method])

    const handleSend = async () => {
        if (!config) return
        setLoading(true)
        setReport(null)
        try {
            const runConfig = { ...config }

            // Ensure duration has units if it's just a number (e.g. "10" -> "10s")
            if (runConfig.duration && /^\d+$/.test(runConfig.duration)) {
                runConfig.duration = `${runConfig.duration}s`
            }

            const res = await api.runLoadTest(runConfig)
            setReport(res)
        } catch (err) {
            alert("Load Test Failed")
        } finally {
            setLoading(false)
        }
    }

    const handleInvoke = async () => {
        if (!config) return
        setInvokeLoading(true)
        setInvokeResult(null)
        try {
            const res = await api.invoke(config)
            setInvokeResult(res)
        } catch (err: any) {
            setInvokeResult({ error: err?.message ?? 'Invoke failed' })
        } finally {
            setInvokeLoading(false)
        }
    }

    return {
        config,
        setConfig,
        report,
        invokeResult,
        loading,
        invokeLoading,
        services,
        methods,
        serviceDefs,
        inputSchema,
        protoFile,
        handleProtoUpload,
        handleServiceChange,
        handleMethodChange,
        handleSend,
        handleInvoke
    }
}
