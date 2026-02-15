import { useEffect, useState } from 'react'
import { Folder, FileCode, ChevronRight, ChevronDown, Plus, Box, Edit2, Trash2 } from 'lucide-react'
import { api } from '../../api/client'
import type { TreeItem } from '../../types'
import { cn } from '../../lib/utils'

interface SidebarProps {
    projectId: number | null
    onSelectTest: (testId: number) => void
}

export function Sidebar({ projectId, onSelectTest }: SidebarProps) {
    const [tree, setTree] = useState<TreeItem | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!projectId) return
        loadTree(projectId)
    }, [projectId])

    const loadTree = async (id: number) => {
        setLoading(true)
        try {
            const data = await api.getTree(id)
            if (Array.isArray(data) && data.length > 0) {
                setTree(data[0])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateFolder = async () => {
        if (!projectId) return
        const name = prompt("Folder Name")
        if (!name) return
        try {
            await api.createFolder(projectId, name)
            loadTree(projectId)
        } catch (err) {
            alert("Failed to create folder")
        }
    }

    const handleCreateTest = async (folderId: number) => {
        if (!projectId) return
        const name = prompt("Test Name")
        if (!name) return
        try {
            await api.createTest(folderId, name)
            loadTree(projectId)
        } catch (err) {
            alert("Failed to create test")
        }
    }

    const handleEdit = async (item: TreeItem) => {
        if (!projectId) return
        const newName = prompt("New Name", item.name)
        if (!newName || newName === item.name) return

        try {
            if (item.type === 'project') {
                await api.updateProject(parseInt(item.id), newName)
            } else if (item.type === 'folder') {
                await api.updateFolder(parseInt(item.id), newName)
            } else if (item.type === 'test') {
                // For test update, we need the config. 
                // Here we only update name. API client updateTest expects config.
                // We need to fetch test, update name, and save back.
                const test = await api.getTest(parseInt(item.id))
                await api.updateTest(test.id, newName, test.config)
            }
            loadTree(projectId)
        } catch (err) {
            console.error(err)
            alert("Failed to update")
        }
    }

    const handleDelete = async (item: TreeItem) => {
        if (!projectId) return
        if (!confirm(`Delete ${item.type} "${item.name}"?`)) return

        try {
            if (item.type === 'project') {
                await api.deleteProject(parseInt(item.id))
                // If project deleted, maybe clear selection or go to list
                setTree(null)
            } else if (item.type === 'folder') {
                await api.deleteFolder(parseInt(item.id))
            } else if (item.type === 'test') {
                await api.deleteTest(parseInt(item.id))
            }
            loadTree(projectId)
        } catch (err) {
            console.error(err)
            alert("Failed to delete")
        }
    }

    if (!projectId) {
        return (
            <aside className="w-full h-full p-4 text-zinc-500 text-sm">
                Select a project
            </aside>
        )
    }

    return (
        <aside className="w-full h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="font-bold text-zinc-100 flex items-center gap-2">
                    <Box className="w-5 h-5 text-emerald-500" />
                    <span>Explorer</span>
                </div>
                <button onClick={handleCreateFolder} className="text-zinc-400 hover:text-zinc-100" title="Create Folder">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="text-xs text-zinc-500 p-2">Loading...</div>
                ) : tree ? (
                    <TreeNode
                        item={tree}
                        onCreateTest={handleCreateTest}
                        onSelectTest={onSelectTest}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="text-xs text-zinc-500 p-2">No data</div>
                )}
            </div>
        </aside>
    )
}

function TreeNode({ item, level = 0, onCreateTest, onSelectTest, onEdit, onDelete }: {
    item: TreeItem,
    level?: number,
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
