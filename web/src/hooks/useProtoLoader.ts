import { useState, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { api } from '../lib/api'
import type { FieldDesc, ServiceDesc, TestConfig } from '../types'
import { generateTemplate } from '../lib/protoUtils'

export function useProtoLoader(setConfig: Dispatch<SetStateAction<TestConfig>>) {
    const [serviceDefs, setServiceDefs] = useState<ServiceDesc[]>([])
    const [services, setServices] = useState<string[]>([])
    const [methods, setMethods] = useState<string[]>([])
    const [protoFile, setProtoFile] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const loadMethods = (defs: ServiceDesc[], serviceName: string) => {
        const desc = defs.find(s => s.name === serviceName)
        if (!desc) { setMethods([]); return }
        const mnames = desc.methods.map((m: any) => typeof m === 'string' ? m : m.name)
        setMethods(mnames)
        if (mnames.length > 0) {
            const first = mnames[0]
            const tpl = generateTemplate(defs, serviceName, first)
            setConfig(prev => ({ ...prev, method: first, data: tpl }))
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
            alert('Proto upload failed')
        } finally {
            setLoading(false)
        }
    }

    const handleServiceChange = (svc: string) => {
        setConfig(prev => ({ ...prev, service: svc }))
        loadMethods(serviceDefs, svc)
    }

    const handleMethodChange = (methodName: string) => {
        setConfig(prev => {
            const tpl = generateTemplate(serviceDefs, prev.service, methodName)
            return { ...prev, method: methodName, data: tpl }
        })
    }

    const getInputSchema = (service: string, method: string): FieldDesc | null => {
        if (!serviceDefs.length || !service || !method) return null
        const svc = serviceDefs.find(s => s.name === service)
        if (!svc) return null
        const m = svc.methods.find((m: any) => (typeof m === 'string' ? m : m.name) === method)
        if (!m || typeof m === 'string') return null
        return (m as any).inputSchema || null
    }

    return {
        services,
        methods,
        protoFile,
        protoLoading: loading,
        getInputSchema,
        handleProtoUpload,
        handleServiceChange,
        handleMethodChange
    }
}
