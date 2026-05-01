import type { Test, TestConfig } from '../../types/models'
import { request } from './request'

export const testsApi = {
    get: (id: number) => request<Test>(`/tests/${id}`),
    create: (folderId: number, name: string) => request<Test>(`/folders/${folderId}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            config: { service: '', method: '', data: '{}', insecure: true }
        })
    }),
    update: (id: number, name: string, config: TestConfig) => request<Test>(`/tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config })
    }),
    delete: (id: number) => request<void>(`/tests/${id}`, { method: 'DELETE' })
}
