const {ipcRenderer} = require('electron')
const settingsLib = require('../settings')
var settings = new settingsLib()

function init(){
    var obj = settings.getObject();
    document.getElementById("location").value = obj.list
    document.getElementById("autoPlay").checked = obj.autoplay
    document.getElementById("referenceNames").checked = obj.referenceNames
    document.getElementById("autoReference").value = obj.autoReference

}
function selectDir(){
    ipcRenderer.invoke('openDialog').then((result) => {
       if(!result.canceled){
           document.getElementById("location").value=result.filePaths[0]+"/"
       }
    })

}
function save(){
    var obj = settings.getObject();
    obj.list = document.getElementById("location").value
    obj.autoplay = document.getElementById("autoPlay").checked
    obj.referenceNames = document.getElementById("referenceNames").checked
    obj.autoReference = document.getElementById("autoReference").value
    settings.saveObject(obj)
    init()
    alert("Niektóre zmiany będą widoczne dopiero po uruchomieniu aplikacji ponownie")
}