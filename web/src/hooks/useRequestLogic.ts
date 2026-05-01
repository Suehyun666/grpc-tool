import { useState, useEffect, useMemo } from 'react'
import { api } from '../lib/api'
import type { LoadTestReport, InvokeResult } from '../types/api'
import type { TestConfig } from '../types'
import { useProtoLoader } from './useProtoLoader'

const DEFAULT_CONFIG: TestConfig = {
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
    const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG)
    const [report, setReport] = useState<LoadTestReport | null>(null)
    const [invokeResult, setInvokeResult] = useState<InvokeResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [invokeLoading, setInvokeLoading] = useState(false)

    const proto = useProtoLoader(setConfig)

    useEffect(() => {
        setConfig(DEFAULT_CONFIG)
        setReport(null)
        setInvokeResult(null)
        if (testId) loadTest(testId)
    }, [testId])

    const loadTest = async (id: number) => {
        try {
            setLoading(true)
            const test = await api.getTest(id)
            if (test?.config) setConfig({ ...DEFAULT_CONFIG, ...test.config })
        } catch (err) {
            console.error('Failed to load test', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async () => {
        setLoading(true)
        setReport(null)
        try {
            const runConfig = { ...config }
            if (runConfig.duration && /^\d+$/.test(runConfig.duration)) {
                runConfig.duration = `${runConfig.duration}s`
            }
            const res = await api.runLoadTest(runConfig)
            setReport(res)
        } catch {
            alert('Load Test Failed')
        } finally {
            setLoading(false)
        }
    }

    const handleInvoke = async () => {
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

    const inputSchema = useMemo(
        () => proto.getInputSchema(config.service, config.method),
        [config.service, config.method, proto.getInputSchema]
    )

    return {
        config,
        setConfig,
        report,
        invokeResult,
        loading,
        invokeLoading,
        inputSchema,
        protoFile: proto.protoFile,
        services: proto.services,
        methods: proto.methods,
        handleProtoUpload: proto.handleProtoUpload,
        handleServiceChange: proto.handleServiceChange,
        handleMethodChange: proto.handleMethodChange,
        handleSend,
        handleInvoke
    }
}
