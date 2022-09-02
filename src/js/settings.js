const {ipcRenderer} = require('electron')
function selectDir(){
    ipcRenderer.invoke('openDirDialog').then((result) => {
       console.log(result)
    })

}