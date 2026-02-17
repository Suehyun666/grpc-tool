export interface LatencyDistribution {
    percentage: number
    latency: number   // nanoseconds
}

export interface Bucket {
    mark: number       // seconds (float64)
    count: number
    frequency: number  // 0.0~1.0
}

export interface ResultDetail {
    timestamp: string
    latency: number
    error: string
    status: string
}

export interface LoadTestReport {
    name: string
    endReason: string
    date: string
    count: number
    total: number        // nanoseconds
    average: number      // nanoseconds
    fastest: number      // nanoseconds
    slowest: number      // nanoseconds
    rps: number
    errorDistribution: Record<string, number>
    statusCodeDistribution: Record<string, number>
    latencyDistribution: LatencyDistribution[]
    histogram: Bucket[]
    details: ResultDetail[]
    options: any
    tags: Record<string, string>
}

export interface ProtoUploadResponse {
    message: string
    file: string
    path: string
    services: ServiceDesc[]
}

export interface ServiceDesc {
    name: string
    methods: (string | MethodDesc)[]
}

export interface MethodDesc {
    name: string
    inputType: string
    inputTypeFull: string
    outputType: string
    outputTypeFull: string
    clientStreaming: boolean
    serverStreaming: boolean
    inputSchema: any
}

export interface FieldDesc {
    name: string
    type: string
    label?: string
    jsonName?: string
    isMap?: boolean
    isOneof?: boolean
    children?: FieldDesc[]
    enumVals?: string[]
}
