import type { Project } from '../../types/models'

interface ProjectSwitcherProps {
    projects: Project[]
    selectedId: number | null
    onSelect: (id: number) => void
    onCreate: () => void
}

export function ProjectSwitcher({ projects, selectedId, onSelect, onCreate }: ProjectSwitcherProps) {
    return (
        <div className="h-12 border-b border-zinc-800 flex items-center px-3 gap-2 bg-zinc-950">
            <select
                className="bg-zinc-900 border border-zinc-700 text-xs rounded p-1 flex-1 min-w-0 text-zinc-300 focus:ring-0 focus:outline-none"
                value={selectedId || ''}
                onChange={e => onSelect(Number(e.target.value))}
            >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button
                onClick={onCreate}
                className="text-xs bg-zinc-800 px-2.5 py-1 rounded hover:bg-zinc-700 text-zinc-300"
            >
                +
            </button>
        </div>
    )
}
