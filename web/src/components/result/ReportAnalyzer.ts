import type { ResultDetail } from "../../types/api"

export interface BucketMetrics {
    timestamp: number // ms from start
    count: number
    rps: number
    errorCount: number
    errorRate: number
    avgLatency: number
    p50: number
    p90: number
    p95: number
    p99: number
}

export class ReportAnalyzer {
    private details: ResultDetail[]
    private startTime: number
    private endTime: number

    constructor(details: ResultDetail[]) {
        this.details = details.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        if (this.details.length > 0) {
            this.startTime = new Date(this.details[0].timestamp).getTime()
            this.endTime = new Date(this.details[this.details.length - 1].timestamp).getTime()
        } else {
            this.startTime = 0
            this.endTime = 0
        }
    }

    public processBuckets(resolutionMs: number = 1000): BucketMetrics[] {
        if (this.details.length === 0) return []

        const duration = this.endTime - this.startTime
        const bucketCount = Math.ceil(duration / resolutionMs) || 1
        const buckets: ResultDetail[][] = Array.from({ length: bucketCount }, () => [])

        // Distribute details into buckets
        this.details.forEach(d => {
            const t = new Date(d.timestamp).getTime()
            const offset = t - this.startTime
            const bucketIndex = Math.min(Math.floor(offset / resolutionMs), bucketCount - 1)
            buckets[bucketIndex].push(d)
        })

        // Calculate metrics for each bucket
        return buckets.map((bucketDetails, index) => {
            const timestamp = index * resolutionMs
            const count = bucketDetails.length
            const rps = count / (resolutionMs / 1000)

            const errorCount = bucketDetails.filter(d => d.status !== "OK" && d.status !== "" && d.error !== "").length
            const errorRate = errorCount / (resolutionMs / 1000)

            let avgLatency = 0
            let p50 = 0
            let p90 = 0
            let p95 = 0
            let p99 = 0

            if (count > 0) {
                const latencies = bucketDetails.map(d => d.latency).sort((a, b) => a - b)
                const totalLatency = latencies.reduce((sum, l) => sum + l, 0)
                avgLatency = totalLatency / count

                p50 = this.getPercentile(latencies, 50)
                p90 = this.getPercentile(latencies, 90)
                p95 = this.getPercentile(latencies, 95)
                p99 = this.getPercentile(latencies, 99)
            }

            return {
                timestamp,
                count,
                rps,
                errorCount,
                errorRate,
                avgLatency,
                p50,
                p90,
                p95,
                p99
            }
        })
    }

    private getPercentile(sortedData: number[], percentile: number): number {
        if (sortedData.length === 0) return 0
        const index = Math.ceil((percentile / 100) * sortedData.length) - 1
        return sortedData[Math.max(0, index)]
    }
}
