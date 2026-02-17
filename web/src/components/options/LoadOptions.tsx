import type { TestConfig } from '../../types'
import { cn } from '../../lib/utils'

interface LoadOptionsProps {
    config: TestConfig
    onChange: (cfg: TestConfig) => void
}

type FieldType = 'number' | 'text'

interface FieldDef {
    key: keyof TestConfig
    label: string
    type?: FieldType
    placeholder?: string
    group: 'basic' | 'schedule'
}

const FIELDS: FieldDef[] = [
    // Basic
    { key: 'totalRequests', label: 'Total Requests', type: 'number', group: 'basic' },
    { key: 'rps', label: 'RPS', type: 'number', group: 'basic' },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: '10s', group: 'basic' },
    { key: 'concurrency', label: 'Concurrency', type: 'number', group: 'basic' },
    { key: 'connections', label: 'Connections', type: 'number', group: 'basic' },
    // Load Schedule
    { key: 'loadSchedule', label: 'Load Schedule', type: 'text', placeholder: 'const / step / line', group: 'schedule' },
    { key: 'loadStart', label: 'Start RPS', type: 'number', group: 'schedule' },
    { key: 'loadEnd', label: 'End RPS', type: 'number', group: 'schedule' },
    { key: 'loadStep', label: 'Step (RPS)', type: 'number', group: 'schedule' },
    { key: 'loadStepDuration', label: 'Step Duration', type: 'text', placeholder: '5s', group: 'schedule' },
]

export function LoadOptions({ config, onChange }: LoadOptionsProps) {
    const handleChange = (key: keyof TestConfig, val: string) => {
        let value: any = val
        const field = FIELDS.find(f => f.key === key)
        if (field?.type === 'number') {
            value = parseInt(val) || 0
        }
        onChange({ ...config, [key]: value })
    }

    const basicFields = FIELDS.filter(f => f.group === 'basic')
    const scheduleFields = FIELDS.filter(f => f.group === 'schedule')

    return (
        <div className="space-y-4">
            {/* Basic */}
            <div>
                <div className="text-xs font-bold text-zinc-500 mb-2">Basic</div>
                <div className={cn("grid gap-3", "grid-cols-3")}>
                    {basicFields.map(field => (
                        <div key={field.key}>
                            <label className="text-xs text-zinc-500 block mb-1">{field.label}</label>
                            <input
                                type={field.type || 'text'}
                                value={config[field.key] as string | number}
                                onChange={e => handleChange(field.key, e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-sm text-zinc-200 w-full focus:outline-none focus:border-emerald-500/50"
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Load Schedule */}
            <div>
                <div className="text-xs font-bold text-zinc-500 mb-2">Load Schedule</div>
                <div className={cn("grid gap-3", "grid-cols-3")}>
                    {scheduleFields.map(field => (
                        <div key={field.key}>
                            <label className="text-xs text-zinc-500 block mb-1">{field.label}</label>
                            <input
                                type={field.type || 'text'}
                                value={config[field.key] as string | number}
                                onChange={e => handleChange(field.key, e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-sm text-zinc-200 w-full focus:outline-none focus:border-emerald-500/50"
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
