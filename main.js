const electron = require('electron')
const { app, dialog, ipcMain } = require('electron')
const { autoUpdater } = require("electron-differential-updater")
const isDev = require('electron-is-dev');
//const test = require('./test.js')
const BrowserWindow = electron.BrowserWindow
const path = require('path')
app.allowRendererProcessReuse=false
app.commandLine.appendSwitch('high-dpi-support', 1)
app.commandLine.appendSwitch('force-device-scale-factor', 1)
let mainWindow = null
let updateWindow = null
let closeandinstall = false


autoUpdater.on('error', err => {
  console.error(err)
  updateWindow.close()
})

autoUpdater.on('checking-for-update', () => {
  updateWindow.webContents.send('update-msg', 'Checking for updates')
  updateWindow.show()
})

autoUpdater.on('update-not-available', () => {
  updateWindow.close()
})

autoUpdater.on('download-progress', (progressObj) => {
    // let log_message = "Download speed: " + progressObj.bytesPerSecond;
    // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    updateWindow.webContents.send('update-data', progressObj);
})

autoUpdater.on('update-available', (event) => {
  updateWindow.webContents.send('update-msg', 'Update available');
})
// Ask the user if update is available
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  updateWindow.webContents.send('update-ready', true);
  // const dialogOpts = {
  //   type: 'info',
  //   buttons: ['Restart', 'Later'],
  //   title: 'Application Update',
  //   message: process.platform === 'win32' ? releaseNotes : releaseName,
  //   detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  // }
  //
  // dialog.showMessageBox(dialogOpts).then((returnValue) => {
  //   if (returnValue.response === 0) autoUpdater.quitAndInstall()
  // })
})

ipcMain.on('update-command', (event, shouldUpdate) => {
  if(shouldUpdate) {
    closeandinstall = true
    autoUpdater.quitAndInstall()
  } else updateWindow.close()
});





/*************************************************************
 * py process
 *************************************************************/
const PY_BIN_FOLDER = 'kekdesktop_api'
const PY_FOLDER = 'pydebug'
const PY_MODULE = 'kekdesktop_api' // without .py suffix
const PY_FORCE = 'bin'

let pyProc = null
let pyPort = null


const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

// Function to convert an Uint8Array to a string
var uint8arrayToString = function(data){
    return String.fromCharCode.apply(null, data);
};

const guessPackaged = () => {
  if (PY_FORCE == ''){
    const fullPath = path.join(__dirname, PY_FOLDER, PY_MODULE + '.py')
    return require('fs').existsSync(fullPath)
  }
  if (PY_FORCE == 'py') return true
  if (PY_FORCE == 'bin') return false



}

const getScriptPath = () => {
  if (guessPackaged()) {
    return path.join(__dirname, PY_FOLDER, PY_MODULE + '.py')
  }
  else {
    return path.join(__dirname, PY_BIN_FOLDER, PY_MODULE + '.exe')
  }
}

const selectPort = () => {
  pyPort = 4242
  return pyPort
}

const createPyProc = () => {
  let script = getScriptPath()
  let port = '' + selectPort()
  let context = 'py'

  if (!guessPackaged()) {
    pyProc = require('child_process').execFile(script, [port])
    context = 'bin'
  } else {
    pyProc = require('child_process').spawn('python', [script, port])
    context = 'py'
  }

  // Handle normal output
  pyProc.stdout.on('data', (data) => {
    if (context == 'py') data = uint8arrayToString(data);
    data.split('\n').forEach(function(element){
      if (element != '') {
        if (element.indexOf('*ReportBot*') == 0){
          data_json = JSON.parse(element.slice('*ReportBot*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'ReportBot'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*AcceptFollowers*') == 0){
          data_json = JSON.parse(element.slice('*AcceptFollowers*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'AcceptFollowers'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*DMDeleter*') == 0){
          data_json = JSON.parse(element.slice('*DMDeleter*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'DMDeleter'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*PostDeleter*') == 0){
          data_json = JSON.parse(element.slice('*PostDeleter*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'PostDeleter'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*AppealBot*') == 0){
          data_json = JSON.parse(element.slice('*AppealBot*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'AppealBot'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*AutoPoster*') == 0){
          data_json = JSON.parse(element.slice('*AutoPoster*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'AutoPoster'
          mainWindow.webContents.send('print-bot', data_json)
        }else if (element.indexOf('*AutoPosterFree*') == 0){
          data_json = JSON.parse(element.slice('*AutoPosterFree*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'AutoPosterFree'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*AutoDM*') == 0){
          data_json = JSON.parse(element.slice('*AutoDM*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'AutoDM'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*AutoDMFree*') == 0){
          data_json = JSON.parse(element.slice('*AutoDMFree*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'AutoDMFree'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*UnfollowerBot*') == 0){
          data_json = JSON.parse(element.slice('*UnfollowerBot*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'UnfollowerBot'
          mainWindow.webContents.send('print-bot', data_json)
        } else if (element.indexOf('*PostSpammer*') == 0){
          data_json = JSON.parse(element.slice('*PostSpammer*'.length+1));
          console.log('json: '+JSON.stringify(data_json));
          data_json['botname'] = 'PostSpammer'
          mainWindow.webContents.send('print-bot', data_json)
        } else{
          console.log('Undetected: '+element)
        }
      }
    });
  });

  // Handle error output
  pyProc.stderr.on('data', (data) => {
      // As said before, convert the Uint8Array to a readable string.
      if (context == 'py') data = uint8arrayToString(data)
      console.log(data);
  });

  pyProc.on('exit', (code) => {
      console.log("Process quit with code : " + code);
  });

  if (pyProc != null) {
    //console.log(pyProc)
    console.log(context+' child process success on port ' + port)
  }
}

const exitPyProc = () => {
  pyProc.kill()
  pyProc = null
  pyPort = null
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)



/*************************************************************
 * window management
 *************************************************************/



const createUpdateWindow = () => {
  let factor = 1
  if (screenRes['width'] < 1400 || screenRes['height'] < 800 ){
     factor = (screenRes['width']*0.8)/1400
  }
  updateWindow = new BrowserWindow({
    width: (325 * factor),
    height: (400 * factor),
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: false,
    webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: false
  }})

  updateWindow.loadURL(require('url').format({
    pathname: path.join(__dirname, 'update.html'),
    protocol: 'file:',
    slashes: true
  }))
  updateWindow.webContents.openDevTools({ mode: 'detach'})
  updateWindow.on('closed', () => {
    updateWindow = null
  })
  updateWindow.on('close', () => {
    if (!closeandinstall) createWindow()
  })

  updateWindow.on('ready-to-show', () => {
    updateWindow.webContents.setZoomFactor(factor)
    if(!isDev) autoUpdater.checkForUpdates()
    else updateWindow.close()
    // updateWindow.webContents.send('update-ready', true);
    // updateWindow.show()
    // progressObj = {"bytesPerSecond": 1800000, "transferred": 564456, "total": 45654645645, "percent": 20}
    // updateWindow.webContents.send('update-data', progressObj);
  })
}

const createWindow = () => {
  let factor = 1
  if (screenRes['width'] < 1400 || screenRes['height'] < 800 ){
     factor = (screenRes['width']*0.8)/1400
  }
  mainWindow = new BrowserWindow({
    width: 1400 * factor,
    height: 800 * factor,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: isDev
  }})

  mainWindow.loadURL(require('url').format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.webContents.openDevTools({ mode: 'detach'})

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.setZoomFactor(factor)
    mainWindow.show()
    // updateWindow.show()

  })
  console.log(factor)
}
// const menu = electron.Menu.buildFromTemplate([])
electron.Menu.setApplicationMenu(null)
app.on('ready', () => {screenRes = electron.screen.getPrimaryDisplay().size;createUpdateWindow()})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
