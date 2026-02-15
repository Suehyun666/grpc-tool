import { useEffect, useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { RequestPanel } from './components/request/RequestPanel'
import { api } from './api/client'
import type { Project } from './types'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(300)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const list = await api.listProjects()
      setProjects(list)
      if (list.length > 0) {
        setSelectedProjectId(list[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateProject = async () => {
    const name = prompt("Project Name")
    if (!name) return
    try {
      const p = await api.createProject(name)
      setProjects([...projects, p])
      setSelectedProjectId(p.id)
    } catch (err) {
      alert("Failed to create")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      {/* Sidebar Area */}
      <div
        className="flex flex-col border-r border-zinc-800 bg-zinc-950 relative group"
        style={{ width: sidebarWidth }}
      >
        {/* Project Switcher / Header */}
        <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-2 bg-zinc-950 justify-between">
          <select
            className="bg-zinc-900 border border-zinc-700 text-xs rounded p-1 flex-1 min-w-0 text-zinc-300 focus:ring-0 focus:outline-none"
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button onClick={handleCreateProject} className="text-xs bg-zinc-800 px-2.5 py-1 rounded hover:bg-zinc-700 text-zinc-300">+</button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-auto">
          <Sidebar projectId={selectedProjectId} onSelectTest={setSelectedTestId} />
        </div>

        {/* Resizer */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500/50 transition-colors z-10"
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startWidth = sidebarWidth

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = startWidth + (moveEvent.clientX - startX)
              if (newWidth > 150 && newWidth < 600) {
                setSidebarWidth(newWidth)
              }
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950/50">
        {selectedTestId ? (
          <RequestPanel testId={selectedTestId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p>Select a test to start debugging</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
