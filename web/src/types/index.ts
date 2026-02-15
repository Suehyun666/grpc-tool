export interface Project {
    id: number
    name: string
    createdAt: string
    updatedAt: string
    folders?: Folder[]
}

export interface Folder {
    id: number
    name: string
    projectId: number
    tests?: Test[]
}

export interface Test {
    id: number
    name: string
    folderId: number
    config: TestConfig
}

export interface TestConfig {
    host: string
    service: string
    method: string
    protoPath: string
    data: string
    metadata: Record<string, string>
    insecure: boolean
    timeout: number

    // Load Params
    loadSchedule?: string
    rps?: number
    duration?: string
    totalRequests?: number
    concurrency?: number
}

export interface TreeItem {
    id: string
    type: 'project' | 'folder' | 'test'
    name: string
    children?: TreeItem[]
    data?: any
}

export interface InvocationResponse {
    status: string
    statusCode: string
    httpCode: number
    grpcCode: number
    timeMs: number
    timeNs: number
    dataSize: number
    body: any
    headers: Record<string, string[]>
    trailers: Record<string, string[]>
    error?: string
}

export interface LoadTestReport {
    date: string
    count: number
    rps: number
    avgLatency: number
    // ... add more as needed
}
