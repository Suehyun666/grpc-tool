export function formatNano(ns: number): string {
    if (ns >= 1_000_000_000) return `${(ns / 1_000_000_000).toFixed(2)} s`
    if (ns >= 1_000_000) return `${(ns / 1_000_000).toFixed(2)} ms`
    if (ns >= 1_000) return `${(ns / 1_000).toFixed(2)} us`
    return `${ns} ns`
}
