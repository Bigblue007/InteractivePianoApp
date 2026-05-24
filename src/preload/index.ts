import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  readSampleFile: (path: string): Promise<ArrayBuffer> =>
    ipcRenderer.invoke('read-sample-file', path),
  listSampleFiles: (dir: string): Promise<string[]> =>
    ipcRenderer.invoke('list-sample-files', dir),
  getAppDataPath: (): Promise<string> =>
    ipcRenderer.invoke('get-app-data-path'),
  getResourcesPath: (): Promise<string> =>
    ipcRenderer.invoke('get-resources-path'),
  resolveResourcePath: (relativePath: string): Promise<string> =>
    ipcRenderer.invoke('resolve-resource-path', relativePath),
  platform: process.platform,
  isElectron: true
})
