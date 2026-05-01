import type {
    Project, Folder, Test, TestConfig, TreeItem
} from '../types/models'
import type {
    LoadTestReport, ProtoUploadResponse, InvokeResult
} from '../types/api'

const API_BASE = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options)
        if (!res.ok) {
            let errMsg = res.statusText
            try {
                const json = await res.json()
                if (json.error) errMsg = json.error
            } catch { /* ignore */ }
            throw new Error(errMsg)
        }
        // Handle 204 No Content
        if (res.status === 204) {
            return {} as T
        }
        return res.json()
    } catch (err: any) {
        // Network errors or other fetch issues
        throw new Error(err.message || "Network Error")
    }
}

export const api = {
    // Project
    listProjects: () => request<Project[]>('/projects'),
    createProject: (name: string) => request<Project>('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    updateProject: (id: number, name: string) => request<Project>(`/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    deleteProject: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
    getTree: async (projectId: number): Promise<TreeItem[]> => {
        const data = await request<any>(`/projects/${projectId}/tree`)

        // Transform backend response { id, name, folders: [...] } to TreeItem structure
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
    },

    // Folder
    createFolder: (projectId: number, name: string) => request<Folder>(`/projects/${projectId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    updateFolder: (id: number, name: string) => request<Folder>(`/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }),
    deleteFolder: (id: number) => request<void>(`/folders/${id}`, { method: 'DELETE' }),

    // Test
    getTest: (id: number) => request<Test>(`/tests/${id}`),
    createTest: (folderId: number, name: string) => request<Test>(`/folders/${folderId}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            config: {
                service: "",
                method: "",
                data: "{}",
                insecure: true
            }
        })
    }),
    updateTest: (id: number, name: string, config: TestConfig) => request<Test>(`/tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config })
    }),
    deleteTest: (id: number) => request<void>(`/tests/${id}`, { method: 'DELETE' }),

    // Proto
    uploadProto: (formData: FormData) => request<ProtoUploadResponse>('/protos/upload', {
        method: 'POST',
        body: formData
    }),
    listServices: (path: string) => request<string[]>(`/protos/services?path=${encodeURIComponent(path)}`),
    getService: (path: string, service: string) => request<any>(`/protos/service?path=${encodeURIComponent(path)}&service=${encodeURIComponent(service)}`),

    // Run Test
    runLoadTest: (config: TestConfig) => request<LoadTestReport>('/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    }),

    invoke: (config: TestConfig) => request<InvokeResult>('/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    })
}
