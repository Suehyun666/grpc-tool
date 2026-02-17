import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import type { TreeItem } from '../types'

export function useProjectTree(projectId: number | null) {
    const [tree, setTree] = useState<TreeItem | null>(null)
    const [loading, setLoading] = useState(false)

    const loadTree = useCallback(async (id: number) => {
        setLoading(true)
        try {
            const data = await api.getTree(id)
            if (Array.isArray(data) && data.length > 0) {
                setTree(data[0])
            } else {
                setTree(null)
            }
        } catch (err) {
            console.error(err)
            setTree(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (projectId) {
            loadTree(projectId)
        } else {
            setTree(null)
        }
    }, [projectId, loadTree])

    const createFolder = async () => {
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

    const createTest = async (folderId: number) => {
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

    const editItem = async (item: TreeItem) => {
        if (!projectId) return
        const newName = prompt("New Name", item.name)
        if (!newName || newName === item.name) return

        try {
            if (item.type === 'project') {
                await api.updateProject(parseInt(item.id), newName)
            } else if (item.type === 'folder') {
                await api.updateFolder(parseInt(item.id), newName)
            } else if (item.type === 'test') {
                const test = await api.getTest(parseInt(item.id))
                await api.updateTest(test.id, newName, test.config)
            }
            loadTree(projectId)
        } catch (err) {
            console.error(err)
            alert("Failed to update")
        }
    }

    const deleteItem = async (item: TreeItem) => {
        if (!projectId) return
        if (!confirm(`Delete ${item.type} "${item.name}"?`)) return

        try {
            if (item.type === 'project') {
                await api.deleteProject(parseInt(item.id))
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

    return {
        tree,
        loading,
        createFolder,
        createTest,
        editItem,
        deleteItem,
        reload: () => projectId && loadTree(projectId)
    }
}
