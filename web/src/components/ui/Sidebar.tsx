import { useState } from 'react'
import { Folder, FileCode, ChevronRight, ChevronDown, Plus, Box, Edit2, Trash2 } from 'lucide-react'
import type { TreeItem } from '../../types'
import { cn } from '../../lib/utils'
import { useProjectTree } from '../../hooks/useProjectTree'

interface SidebarProps {
    projectId: number | null
    onSelectTest: (testId: number) => void
}

export function Sidebar({ projectId, onSelectTest }: SidebarProps) {
    const { tree, loading, createFolder, createTest, editItem, deleteItem } = useProjectTree(projectId)

    if (!projectId) {
        return (
            <aside className="w-full h-full p-4 text-zinc-500 text-sm">
                Select a project
            </aside>
        )
    }

    return (
        <aside className="w-full h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center">
                <div className="font-bold text-zinc-100 flex items-center gap-2">
                    <Box className="w-5 h-5 text-emerald-500" />
                    <span>Explorer</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="text-xs text-zinc-500 p-2">Loading...</div>
                ) : tree ? (
                    <TreeNode
                        item={tree}
                        onCreateFolder={createFolder}
                        onCreateTest={createTest}
                        onSelectTest={onSelectTest}
                        onEdit={editItem}
                        onDelete={deleteItem}
                    />
                ) : (
                    <div className="text-xs text-zinc-500 p-2">No data</div>
                )}
            </div>
        </aside>
    )
}

function TreeNode({ item, level = 0, onCreateFolder, onCreateTest, onSelectTest, onEdit, onDelete }: {
    item: TreeItem,
    level?: number,
    onCreateFolder: () => void,
    onCreateTest: (folderId: number) => void,
    onSelectTest: (id: number) => void,
    onEdit: (item: TreeItem) => void,
    onDelete: (item: TreeItem) => void
}) {
    const [expanded, setExpanded] = useState(true)
    const isFolder = item.type === 'folder' || item.type === 'project'
    const paddingLeft = level * 12 + 8

    const handleClick = () => {
        if (isFolder) {
            setExpanded(!expanded)
        } else if (item.type === 'test') {
            onSelectTest(parseInt(item.id))
        }
    }

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 pr-2 text-sm cursor-pointer select-none rounded hover:bg-zinc-900 group",
                    item.type === 'test' ? "text-zinc-300" : "text-zinc-100 font-medium",
                )}
                style={{ paddingLeft: `${paddingLeft}px` }}
                onClick={handleClick}
            >
                {isFolder && (
                    <span className="text-zinc-500">
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                )}
                {!isFolder && <div className="w-3.5" />}

                {item.type === 'project' && <Box className="w-4 h-4 text-blue-500" />}
                {item.type === 'folder' && <Folder className="w-4 h-4 text-amber-500" />}
                {item.type === 'test' && <FileCode className="w-4 h-4 text-emerald-500" />}

                <span className="truncate flex-1">{item.name}</span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    {item.type === 'project' && (
                        <button
                            className="text-zinc-500 hover:text-emerald-400"
                            onClick={(e) => {
                                e.stopPropagation()
                                onCreateFolder()
                            }}
                            title="Create Folder"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                    {item.type === 'folder' && (
                        <button
                            className="text-zinc-500 hover:text-emerald-400"
                            onClick={(e) => {
                                e.stopPropagation()
                                onCreateTest(parseInt(item.id))
                            }}
                            title="Create Test"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                    <button
                        className="text-zinc-500 hover:text-blue-400"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(item)
                        }}
                        title="Rename"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                        className="text-zinc-500 hover:text-red-400"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(item)
                        }}
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {isFolder && expanded && item.children && (
                <div>
                    {item.children.map((child) => (
                        <TreeNode key={child.id} item={child} level={level + 1}
                            onCreateFolder={onCreateFolder}
                            onCreateTest={onCreateTest}
                            onSelectTest={onSelectTest}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
