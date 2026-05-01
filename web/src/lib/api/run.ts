import type { TestConfig } from '../../types/models'
import type { InvokeResult, LoadTestReport } from '../../types/api'
import { request } from './request'

export const runApi = {
    loadTest: (config: TestConfig) => request<LoadTestReport>('/run', {
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
