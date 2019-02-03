'use strict'

import {
  app,
  BrowserWindow
} from 'electron'

import {
  setMenu
} from './menu'

// Chrome CLI Settings
// https://electronjs.org/docs/api/chrome-command-line-switches
app.commandLine.appendSwitch('ignore-certificate-errors', 'true')
app.commandLine.appendSwitch('allow-insecure-localhost', 'true')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

async function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 750,
    width: 1200,
    useContentSize: true
  })

  mainWindow.loadURL(winURL)

  // Setup the menu
  setMenu(mainWindow)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
 import { autoUpdater } from 'electron-updater'

 autoUpdater.on('update-downloaded', () => {
   autoUpdater.quitAndInstall()
 })

 app.on('ready', () => {
   if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
 })
  */