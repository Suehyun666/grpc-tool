import type { FieldDesc } from '../../types/api'
import { Plus, Trash2 } from 'lucide-react'

const inputCls = "bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-200 w-full focus:outline-none focus:border-emerald-500/50"

// ─── Utilities ───────────────────────────────────────────────────────────────

export function getDefaultValue(field: FieldDesc): any {
    if (field.label === 'repeated') return []
    switch (field.type) {
        case 'string': return ''
        case 'bool': return false
        case 'int32': case 'int64': case 'uint32': case 'uint64':
        case 'float': case 'double': case 'fixed32': case 'fixed64':
        case 'sfixed32': case 'sfixed64': case 'sint32': case 'sint64':
            return 0
        case 'enum': return field.enumVals?.[0] ?? ''
        case 'message': return {}
        default: return ''
    }
}

// ─── MessageFields ────────────────────────────────────────────────────────────

interface MessageFieldsProps {
    fields: FieldDesc[]
    value: any
    onChange: (val: any) => void
}

export function MessageFields({ fields, value, onChange }: MessageFieldsProps) {
    const obj = value || {}

    const oneofGroups: Record<string, FieldDesc[]> = {}
    const regularFields: FieldDesc[] = []

    for (const field of fields) {
        if (field.isOneof) {
            const groupKey = `oneof_${fields.filter(f => f.isOneof).indexOf(field)}`
            if (!oneofGroups[groupKey]) oneofGroups[groupKey] = []
            oneofGroups[groupKey].push(field)
        } else {
            regularFields.push(field)
        }
    }

    const handleFieldChange = (fieldName: string, val: any) => onChange({ ...obj, [fieldName]: val })

    return (
        <div className="space-y-3">
            {regularFields.map(field => (
                <FieldInput
                    key={field.jsonName || field.name}
                    field={field}
                    value={obj[field.jsonName || field.name]}
                    onChange={val => handleFieldChange(field.jsonName || field.name, val)}
                />
            ))}
            {Object.entries(oneofGroups).map(([key, groupFields]) => (
                <OneofField
                    key={key}
                    fields={groupFields}
                    value={obj}
                    onChange={(name, val) => {
                        const newObj = { ...obj }
                        groupFields.forEach(f => delete newObj[f.jsonName || f.name])
                        newObj[name] = val
                        onChange(newObj)
                    }}
                />
            ))}
        </div>
    )
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

interface FieldInputProps {
    field: FieldDesc
    value: any
    onChange: (val: any) => void
}

export function FieldInput({ field, value, onChange }: FieldInputProps) {
    const name = field.jsonName || field.name

    if (field.label === 'repeated') return <RepeatedField field={field} value={value} onChange={onChange} />

    if (field.type === 'enum' && field.enumVals) return (
        <div>
            <label className="text-xs text-zinc-500 block mb-1">{name} <span className="text-zinc-700">enum</span></label>
            <select value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputCls}>
                <option value="">-- select --</option>
                {field.enumVals.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
        </div>
    )

    if (field.type === 'message' && field.children?.length) return (
        <div>
            <label className="text-xs text-zinc-500 block mb-1">{name} <span className="text-zinc-700">message</span></label>
            <div className="border border-zinc-800 rounded p-2 ml-2">
                <MessageFields fields={field.children} value={value || {}} onChange={onChange} />
            </div>
        </div>
    )

    if (field.type === 'bool') return (
        <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">{name} <span className="text-zinc-700">bool</span></label>
            <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500/20" />
        </div>
    )

    const numberTypes = ['int32', 'int64', 'uint32', 'uint64', 'float', 'double', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'sint32', 'sint64']
    if (numberTypes.includes(field.type)) return (
        <div>
            <label className="text-xs text-zinc-500 block mb-1">{name} <span className="text-zinc-700">{field.type}</span></label>
            <input type="number" value={value ?? ''} className={inputCls} placeholder="0"
                onChange={e => {
                    const v = e.target.value
                    if (v === '') onChange(undefined)
                    else if (['float', 'double'].includes(field.type)) onChange(parseFloat(v))
                    else onChange(parseInt(v))
                }} />
        </div>
    )

    return (
        <div>
            <label className="text-xs text-zinc-500 block mb-1">{name} <span className="text-zinc-700">{field.type}</span></label>
            <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)}
                className={inputCls} placeholder={field.type === 'bytes' ? 'base64 encoded' : ''} />
        </div>
    )
}

// ─── RepeatedField ────────────────────────────────────────────────────────────

function RepeatedField({ field, value, onChange }: FieldInputProps) {
    const arr = Array.isArray(value) ? value : []
    const name = field.jsonName || field.name
    const itemField: FieldDesc = { ...field, label: undefined }

    const addItem = () => onChange([...arr, getDefaultValue(field)])
    const removeItem = (idx: number) => onChange(arr.filter((_: any, i: number) => i !== idx))
    const updateItem = (idx: number, val: any) => { const a = [...arr]; a[idx] = val; onChange(a) }

    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <label className="text-xs text-zinc-500">{name} <span className="text-zinc-700">repeated {field.type}</span></label>
                <button onClick={addItem} className="text-emerald-500 hover:text-emerald-400" title="Add item">
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <div className="space-y-1 ml-2">
                {arr.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-1">
                        <div className="flex-1">
                            <FieldInput field={itemField} value={item} onChange={val => updateItem(idx, val)} />
                        </div>
                        <button onClick={() => removeItem(idx)} className="text-zinc-600 hover:text-red-400 mt-1">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── OneofField ───────────────────────────────────────────────────────────────

function OneofField({ fields, value, onChange }: {
    fields: FieldDesc[]
    value: any
    onChange: (fieldName: string, val: any) => void
}) {
    const selectedField = fields.find(f => value[f.jsonName || f.name] !== undefined)
    const selectedName = selectedField ? (selectedField.jsonName || selectedField.name) : ''

    return (
        <div className="border border-zinc-800 rounded p-2">
            <div className="text-xs text-zinc-600 mb-2">oneof</div>
            <div className="flex gap-2 mb-2">
                {fields.map(f => {
                    const fname = f.jsonName || f.name
                    return (
                        <label key={fname} className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
                            <input type="radio" name={`oneof-${fields.map(f => f.name).join('-')}`}
                                checked={selectedName === fname}
                                onChange={() => onChange(fname, getDefaultValue(f))}
                                className="text-emerald-500" />
                            {fname}
                        </label>
                    )
                })}
            </div>
            {selectedField && (
                <FieldInput
                    field={{ ...selectedField, isOneof: false, label: undefined }}
                    value={value[selectedName]}
                    onChange={val => onChange(selectedName, val)}
                />
            )}
        </div>
    )
}
