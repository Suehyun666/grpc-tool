import { projectsApi } from './api/projects'
import { foldersApi } from './api/folders'
import { testsApi } from './api/tests'
import { protoApi } from './api/proto'
import { runApi } from './api/run'

export const api = {
    // Projects
    listProjects: projectsApi.list,
    createProject: projectsApi.create,
    updateProject: projectsApi.update,
    deleteProject: projectsApi.delete,
    getTree: projectsApi.getTree,
    // Folders
    createFolder: foldersApi.create,
    updateFolder: foldersApi.update,
    deleteFolder: foldersApi.delete,
    // Tests
    getTest: testsApi.get,
    createTest: testsApi.create,
    updateTest: testsApi.update,
    deleteTest: testsApi.delete,
    // Proto
    uploadProto: protoApi.upload,
    listServices: protoApi.listServices,
    getService: protoApi.getService,
    // Run
    runLoadTest: runApi.loadTest,
    invoke: runApi.invoke
}
