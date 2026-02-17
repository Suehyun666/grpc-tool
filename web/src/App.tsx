import { useEffect, useState } from 'react'
import { Sidebar } from './components/ui/Sidebar'
import { RequestPanel } from './components/ui/RequestPanel'
import { ResponsePanel } from './components/ui/ResponsePanel'
import { api } from './lib/api'
import type { Project } from './types/models'
import type { LoadTestReport } from './types/api'


function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [middleWidth, setMiddleWidth] = useState<number | null>(null)
  const [report, setReport] = useState<LoadTestReport | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  // Reset report when test changes
  useEffect(() => {
    setReport(null)
  }, [selectedTestId])

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

  const handleResize = (
    startWidth: number,
    setter: (w: number) => void,
    min: number,
    max: number
  ) => {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      const sx = e.clientX
      const sw = startWidth

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = sw + (moveEvent.clientX - sx)
        if (newWidth > min && newWidth < max) {
          setter(newWidth)
        }
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }

  return (
    <div className="min-h-screen h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      {/* Left Panel - Sidebar */}
      <div
        className="flex flex-col border-r border-zinc-800 bg-zinc-950 relative"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        {/* Project Switcher */}
        <div className="h-12 border-b border-zinc-800 flex items-center px-3 gap-2 bg-zinc-950 justify-between">
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
          onMouseDown={handleResize(sidebarWidth, setSidebarWidth, 150, 400)}
        />
      </div>

      {/* Middle Panel - Request Editor */}
      {selectedTestId ? (
        <>
          <div
            className="flex flex-col min-w-0 border-r border-zinc-800 relative"
            style={middleWidth ? { width: middleWidth, minWidth: 350 } : { flex: '1 1 0%', minWidth: 350 }}
          >
            <RequestPanel
              testId={selectedTestId}
              onReport={setReport}
            />
            {/* Resizer */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500/50 transition-colors z-10"
              onMouseDown={handleResize(middleWidth || 500, (w) => setMiddleWidth(w), 350, 800)}
            />
          </div>

          {/* Right Panel - Response */}
          <div className="flex-1 flex flex-col min-w-[300px] bg-zinc-950">
            <ResponsePanel report={report} />
          </div>
        </>
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-zinc-950">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm">Select a test to start</p>
        </main>
      )}
    </div>
  )
}

export default App
