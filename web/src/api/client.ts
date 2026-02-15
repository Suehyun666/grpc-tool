import type { Project, Folder, Test, TreeItem, InvocationResponse, LoadTestReport, TestConfig } from '../types'

const API_BASE = '/api'

export const api = {
    getTree: async (projectId: number): Promise<TreeItem[]> => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/tree`)
        if (!res.ok) throw new Error('Failed to fetch tree')
        const data = await res.json()

        // Transform raw response to TreeItem
        const projectNode: TreeItem = {
            id: String(data.id),
            name: data.name,
            type: 'project',
            children: (data.folders || []).map((f: any) => ({
                id: String(f.id),
                name: f.name,
                type: 'folder',
                children: (f.tests || []).map((t: any) => ({
                    id: String(t.id),
                    name: t.name,
                    type: 'test'
                }))
            }))
        }
        return [projectNode]
    },

    listProjects: async (): Promise<Project[]> => {
        const res = await fetch(`${API_BASE}/projects`)
        if (!res.ok) throw new Error('Failed to fetch projects')
        return res.json()
    },

    createProject: async (name: string): Promise<Project> => {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error('Failed to create project')
        return res.json()
    },

    uploadProto: async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`${API_BASE}/protos/upload`, {
            method: 'POST',
            body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload proto')
        return res.json()
    },

    invoke: async (config: TestConfig): Promise<InvocationResponse> => {
        const res = await fetch(`${API_BASE}/invoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        })
        if (!res.ok) throw new Error('Invocation failed')
        return res.json()
    },

    runLoadTest: async (config: TestConfig): Promise<LoadTestReport> => {
        const res = await fetch(`${API_BASE}/load-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        })
        if (!res.ok) throw new Error('Load test failed')
        return res.json()
    },

    getTest: async (id: number): Promise<Test> => {
        const res = await fetch(`${API_BASE}/tests/${id}`)
        if (!res.ok) throw new Error('Failed to fetch test')
        return res.json()
    },

    updateTest: async (id: number, name: string, config: TestConfig) => {
        const res = await fetch(`${API_BASE}/tests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, config }),
        })
        if (!res.ok) throw new Error('Failed to update test')
        return res.json()
    },

    createFolder: async (projectId: number, name: string): Promise<Folder> => {
        const res = await fetch(`${API_BASE}/projects/${projectId}/folders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error('Failed to create folder')
        return res.json()
    },

    createTest: async (folderId: number, name: string): Promise<Test> => {
        // Backend expects { name: "...", ... }
        // TestHandler.Create binds `createTestRequest`.
        const res = await fetch(`${API_BASE}/folders/${folderId}/tests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, service: "", method: "", data: "{}" }),
        })
        if (!res.ok) throw new Error('Failed to create test')
        return res.json()
    },

    updateProject: async (id: number, name: string): Promise<Project> => {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error('Failed to update project')
        return res.json()
    },

    deleteProject: async (id: number): Promise<void> => {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete project')
    },

    updateFolder: async (id: number, name: string): Promise<Folder> => {
        const res = await fetch(`${API_BASE}/folders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error('Failed to update folder')
        return res.json()
    },

    deleteFolder: async (id: number): Promise<void> => {
        const res = await fetch(`${API_BASE}/folders/${id}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete folder')
    },

    deleteTest: async (id: number): Promise<void> => {
        const res = await fetch(`${API_BASE}/tests/${id}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete test')
    }
}
