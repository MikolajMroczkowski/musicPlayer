const {app, BrowserWindow, Menu, dialog, ipcMain} = require('electron')
const path = require('path')
const settingsLib = require('./settings')
var reg = false;
var settings = new settingsLib()
const createWindow = (file, hide) => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: hide,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    mainWindow.loadFile(file)
    mainWindow.webContents.openDevTools()
    if (!reg) {
        reg = true
        ipcMain.handle('openDialog', async (event, arg) => {
            return await dialog.showOpenDialog(mainWindow, {properties: ['openDirectory']})
        })
        ipcMain.on('userData', (event, arg) => {
            event.returnValue = app.getPath("userData")
        })
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow('src/html/index.html', false)

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})


const template = [
    {
        label: 'List',
        submenu: [
            {
                label: 'Wybierz lokalizację',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog({
                        properties: ['openDirectory']
                    }).then(result => {
                        if (result.canceled) {
                            return;
                        }
                        var s = settings.getObject()
                        s.list = result.filePaths[0] + "/"
                        settings.saveObject(s)

                        focusedWindow.reload();

                    }).catch(err => {
                        console.log(err)
                    })
                },

            },
            {
                label: "Dodaj utwór",
                click: (item, focusedWindow) => {
                    createWindow('src/html/addSong.html', true)
                }
            },
            {
                label: "Zarządzaj dowiązaniami",
                click: (item, focusedWindow) => {
                    createWindow('src/html/reference.html', true)
                }
            },
        ]
    }, {
        label: "Ustawienia",
        submenu: [{
            label: "uruchom ustawienia",
            click: (item, focusedWindow) => {
                createWindow('src/html/settings.html', true)
            }
        }]
    }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
