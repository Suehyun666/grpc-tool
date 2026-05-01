import type { ProtoUploadResponse } from '../../types/api'
import { request } from './request'

export const protoApi = {
    upload: (formData: FormData) => request<ProtoUploadResponse>('/protos/upload', {
        method: 'POST',
        body: formData
    }),
    listServices: (path: string) => request<string[]>(`/protos/services?path=${encodeURIComponent(path)}`),
    getService: (path: string, service: string) => request<any>(
        `/protos/service?path=${encodeURIComponent(path)}&service=${encodeURIComponent(service)}`
    )
}
