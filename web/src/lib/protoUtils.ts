
import type { ServiceDesc } from '../types'

export function generateTemplate(services: ServiceDesc[], serviceName: string, methodName: string): string {
    try {
        const service = services.find(s => s.name === serviceName)
        if (!service) return '{}'

        const method = service.methods.find(m => typeof m !== 'string' && m.name === methodName) as any
        if (!method || !method.inputSchema) return '{}'

        // Assuming inputSchema is a JSON schema or similar
        // If the backend returns 'inputType.fields' in a simplified structure, we use that.
        // Wait, 'getService' from before returned `desc.methods[...]` with `inputType.fields`.
        // The ServiceDesc interface in api.ts has:
        /*
        export interface MethodDesc {
            name: string
            inputType: string
            inputSchema: any // This is likely what we used
            ...
        }
        */

        // Use inputSchema to generate mock
        // If inputSchema is fields map:
        const mock: any = {}
        // Backend 'ProtoParserService' likely returns a custom schema object.
        // Let's assume inputSchema has a 'fields' property based on previous code:
        // `Object.entries(methodDesc.inputType.fields)` -> this looks like methodDesc was deferent in previous code?
        // In previous `protoUtils.ts`, we accessed `methodDesc.inputType.fields`.
        // In `types/modules/api.ts`: `inputSchema: any`.
        // I will assume `inputSchema` matches what we need or I need to check backend `proto_parser.go`.
        // For now, let's assume `inputSchema` is the object with `fields`.

        if (method.inputSchema && method.inputSchema.fields) {
            for (const [name, type] of Object.entries(method.inputSchema.fields)) {
                mock[name] = getPlaceholder(type as string)
            }
        }

        return JSON.stringify(mock, null, 2)
    } catch (err) {
        console.error("Template gen failed", err)
        return '{\n  "key": "value"\n}'
    }
}

function getPlaceholder(type: string): any {
    switch (type) {
        case 'TYPE_STRING': return "text"
        case 'TYPE_INT32':
        case 'TYPE_INT64': return 123
        case 'TYPE_BOOL': return true
        case 'TYPE_FLOAT':
        case 'TYPE_DOUBLE': return 1.23
        case 'TYPE_MESSAGE': return {} // simplified
        default: return null
    }
}
