export const API_BASE = '/api'

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
        if (res.status === 204) return {} as T
        return res.json()
    } catch (err: any) {
        throw new Error(err.message || 'Network Error')
    }
}
