import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { readFile, readdir } from 'fs/promises'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Harmonia Desktop',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'), // electron-vite builds to index.mjs or index.js depending on type
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the remote URL for development or the local html file for production
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// IPC handlers for sample loading from disk
ipcMain.handle('read-sample-file', async (_, filePath: string) => {
  try {
    const buffer = await readFile(filePath)
    // Convert Buffer to ArrayBuffer to send over IPC
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  } catch (error) {
    console.error('Failed to read sample file:', filePath, error)
    throw error
  }
})

ipcMain.handle('list-sample-files', async (_, dirPath: string) => {
  try {
    // readdir with recursive is supported in Node 20+
    return await readdir(dirPath, { recursive: true })
  } catch (error) {
    console.error('Failed to list sample files:', dirPath, error)
    throw error
  }
})

ipcMain.handle('get-app-data-path', () => {
  return app.getPath('userData')
})

ipcMain.handle('get-resources-path', () => {
  // Returns path to bundled resources/extraResources
  return process.resourcesPath
})

ipcMain.handle('resolve-resource-path', (_, relativePath: string) => {
  if (app.isPackaged) {
    // V produkci jsou extraResources v resourcesPath (např. resources/samples)
    return join(process.resourcesPath, relativePath)
  } else {
    // Ve vývoji jsou v public složce v rootu projektu
    return join(process.cwd(), 'public', relativePath)
  }
})

