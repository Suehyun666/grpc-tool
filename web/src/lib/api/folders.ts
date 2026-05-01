import type { Folder } from '../../types/models'
import { request } from './request'

export const foldersApi = {
    create: (projectId: number, name: string) => request<Folder>(`/projects/${projectId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    update: (id: number, name: string) => request<Folder>(`/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    delete: (id: number) => request<void>(`/folders/${id}`, { method: 'DELETE' })
}
