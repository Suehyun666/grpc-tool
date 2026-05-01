import type { FieldDesc } from '../../types/api'
import { MessageFields } from '../proto/Fields'

interface ProtoFormProps {
    schema: FieldDesc | null
    value: string
    onChange: (json: string) => void
}

export function ProtoForm({ schema, value, onChange }: ProtoFormProps) {
    const parsed = (() => { try { return JSON.parse(value) } catch { return {} } })()

    if (!schema?.children) {
        return (
            <div className="text-xs text-zinc-500 italic p-3 bg-zinc-900/50 border border-zinc-800 rounded">
                Upload a proto file to see form fields
            </div>
        )
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-3 space-y-2">
            <MessageFields
                fields={schema.children}
                value={parsed}
                onChange={newObj => onChange(JSON.stringify(newObj, null, 2))}
            />
        </div>
    )
}
