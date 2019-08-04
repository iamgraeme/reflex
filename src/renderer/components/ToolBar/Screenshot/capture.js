const {
  dialog
} = require('electron').remote
const {
  clipboard,
  nativeImage
} = require('electron')
const path = require('path')
const fs = require('fs')
const moment = require('moment')

export async function capture(id, title, screenshotPath) {
  async function saveScreenshot(screenshot) {
    if (!screenshotPath) {
      // Case: no path set yet (single screenshot save)
      // Prompt location to save screenshot
      dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory', 'createDirectory']
      },
      function (filePaths) {
        try {
          makeFile(filePaths[0], screenshot)
        } catch (e) {
          // Nothing was selected
        }
      }
      )
    } else {
      // Case: already has a path (multi-save)
      makeFile(screenshotPath, screenshot)
    }
  }

  // Create the file
  function makeFile(filePath, screenshot) {
    const timestamp = moment().format('YYYY-MM-D_h-mm-ssa')

    if (title) {
      title = `_${title}_`
    } else {
      title = ''
    }

    fs.writeFile(
      path.join(filePath, `reflex${title}${timestamp}.png`),
      screenshot,
      err => {
        if (err) throw err
        // Alert the user that the screenshot was saved
        let notification = new Notification('Screenshot saved', {
          body: filePath
        })
      }
    )
  }

  try {
    // Capture the <webview>
    const webview = document.querySelectorAll('webview')[id]
    webview.getWebContents().capturePage(image => {
      const PNG = image.toPNG()
      saveScreenshot(PNG)
    })
  } catch (error) {
    throw new Error(error)
  }
}

export function captureMultiple(ids) {
  // Accepts an array of ids to capture [ 0, 1 ]
  if (!ids) return false

  // 1. Capture the path to save all
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory', 'createDirectory']
  },
  async function (filePaths) {
    try {
      // Capture each & save it
      const captureEach = async (array) => {
        for (let item of array) {
          await capture(
            item,
            `${item}`,
            filePaths[0]
          )
        }
      }

      await captureEach(ids)
      return filePaths[0]
    } catch (err) {
      // Nothing was selected
    }
  }
  )
}

// Capture ALL the screens
export async function captureAll(vm) {
  // 1. Get the file path to save all
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory', 'createDirectory']
  },
  async function (filePaths) {
    // 2. Capture each & save it
    for (let i = 0; i < vm.artboards.length; i++) {
      await capture(
        i,
        `${vm.artboards[i].title}_${i}`,
        filePaths[0]
      )
    }

    return filePaths[0]
  }
  )
}

// Take a screenshot
export async function screenshot(id) {
  const webview = document.querySelector('webview')[id]

  try {
    webview.getWebContents().capturePage(image => {
      // Output the image as a NativeImage in PNG format
      // https://electronjs.org/docs/api/native-image
      // via https://github.com/electron/electron/issues/8151#issuecomment-265288291
      const output = nativeImage.createFromBuffer(image.toPNG())
      return output
    })
  } catch (error) {
    throw new Error(error)
  }
}

// Save an image to the user's clipboard
// https://electronjs.org/docs/api/clipboard#clipboardwriteimageimage-type
export async function copyToClipboard(id) {
  const image = await screenshot(id)
  clipboard.writeImage(image)
}