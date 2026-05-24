export interface ElectronAPI {
  readSampleFile: (path: string) => Promise<ArrayBuffer>
  listSampleFiles: (dir: string) => Promise<string[]>
  getAppDataPath: () => Promise<string>
  getResourcesPath: () => Promise<string>
  resolveResourcePath: (relativePath: string) => Promise<string>
  platform: string
  isElectron: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
