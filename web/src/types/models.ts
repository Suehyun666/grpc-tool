export interface Project {
    id: number
    name: string
}

export interface Folder {
    id: number
    name: string
    projectId: number
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

    // Load test basic
    rps: number
    totalRequests: number
    duration: string
    concurrency: number

    // Load schedule
    loadSchedule: string
    loadStart: number
    loadEnd: number
    loadStep: number
    loadStepDuration: string

    // Advanced
    connections: number
    dialTimeout: number
    cpus: number
    concurrencySchedule: string
    concurrencyStart: number
    concurrencyEnd: number
    concurrencyStep: number
    concurrencyStepDuration: string
}

export interface Test {
    id: number
    folderId: number
    name: string
    config: TestConfig
}

export type TreeItem = {
    id: string
    name: string
    type: 'project' | 'folder' | 'test'
    children?: TreeItem[]
}
