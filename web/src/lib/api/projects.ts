import type { Project, TreeItem } from '../../types/models'
import { request } from './request'

export const projectsApi = {
    list: () => request<Project[]>('/projects'),
    create: (name: string) => request<Project>('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    update: (id: number, name: string) => request<Project>(`/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    delete: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
    getTree: async (projectId: number): Promise<TreeItem[]> => {
        const data = await request<any>(`/projects/${projectId}/tree`)
        const projectNode: TreeItem = {
            id: String(data.id),
            name: data.name,
            type: 'project',
            children: (data.folders || []).map((f: any) => ({
                id: String(f.id),
                name: f.name,
                type: 'folder' as const,
                children: (f.tests || []).map((t: any) => ({
                    id: String(t.id),
                    name: t.name,
                    type: 'test' as const
                }))
            }))
        }
        return [projectNode]
    }
}
