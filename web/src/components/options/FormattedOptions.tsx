
const NS_KEYS = new Set(['dial-timeout', 'keepalive', 'timeout', 'load-max-duration', 'concurrency-max-duration', 'load-step-duration', 'concurrency-step-duration'])

function formatNsDuration(ns: number): string {
    if (ns <= 0) return '0'
    if (ns >= 60_000_000_000) return `${(ns / 60_000_000_000).toFixed(0)}m`
    if (ns >= 1_000_000_000) return `${(ns / 1_000_000_000).toFixed(0)}s`
    if (ns >= 1_000_000) return `${(ns / 1_000_000).toFixed(0)}ms`
    return `${ns}ns`
}

function isDefaultValue(key: string, value: any): boolean {
    if (value === 0 || value === '' || value === false || value === null) return true
    if (typeof value === 'string' && value === '') return true
    if (Array.isArray(value) && value.length === 0) return true
    // Hide proto server paths
    if (key === 'proto' || key === 'protoset') return true
    // Hide import-paths (server-internal)
    if (key === 'import-paths') return true
    return false
}

export function FormattedOptions({ options }: { options: any }) {
    if (!options || typeof options !== 'object') return null

    const entries = Object.entries(options).filter(([key, value]) => !isDefaultValue(key, value))

    if (entries.length === 0) return <div className="text-xs text-zinc-500 italic">No options</div>

    return (
        <table className="text-xs font-mono w-full">
            <tbody>
                {entries.map(([key, value]) => (
                    <tr key={key} className="border-b border-zinc-800/30 last:border-0">
                        <td className="text-zinc-500 pr-4 py-0.5 whitespace-nowrap align-top">{key}</td>
                        <td className="text-zinc-400 py-0.5 break-all">
                            {NS_KEYS.has(key) && typeof value === 'number'
                                ? formatNsDuration(value)
                                : typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)
                            }
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
