
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { TestConfig } from '../../types'

interface AdvancedOptionsProps {
    config: TestConfig
    onChange: (cfg: TestConfig) => void
}

interface AdvField {
    key: keyof TestConfig
    label: string
    type?: 'number' | 'text'
    placeholder?: string
}

const ADV_FIELDS: AdvField[] = [
    { key: 'timeout', label: 'Request Timeout (s)', type: 'number' },
    { key: 'dialTimeout', label: 'Dial Timeout (s)', type: 'number' },
    { key: 'cpus', label: 'CPUs', type: 'number' },
    { key: 'concurrencySchedule', label: 'Concurrency Schedule (line, step, const)', type: 'text' },
    { key: 'concurrencyStart', label: 'Conc. Start', type: 'number' },
    { key: 'concurrencyEnd', label: 'Conc. End', type: 'number' },
    { key: 'concurrencyStep', label: 'Conc. Step', type: 'number' },
    { key: 'concurrencyStepDuration', label: 'Conc. Step Duration', type: 'text' },
]

export function AdvancedOptions({ config, onChange }: AdvancedOptionsProps) {
    const [open, setOpen] = useState(false)

    // Helper to check if a field is already shown in ModeOptions (avoid dupes)
    // In Custom mode, ModeOptions shows many fields. We should ensure AdvancedOptions 
    // doesn't duplicate them if they were added there.
    // Currently ModeOptions handles primary fields (rps, duration, etc).
    // AdvancedOptions handles timeouts, CPU, detailed concurrency schedule.
    // Overlap: connections is in ModeOptions for burst/const.
    // We'll keep them separate as defined in ADV_FIELDS.

    const handleChange = (key: keyof TestConfig, val: string) => {
        let value: any = val
        const field = ADV_FIELDS.find(f => f.key === key)
        if (field?.type === 'number') {
            value = parseInt(val) || 0
        }
        onChange({ ...config, [key]: value })
    }

    return (
        <div className="border-t border-zinc-800 pt-2">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 py-2 w-full"
            >
                {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Advanced Options
            </button>

            {open && (
                <div className="grid grid-cols-2 gap-3 mt-2 pb-4">
                    {ADV_FIELDS.map(field => (
                        <div key={field.key}>
                            <label className="text-xs font-bold text-zinc-500 block mb-1.5">{field.label}</label>
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
            )}
        </div>
    )
}
