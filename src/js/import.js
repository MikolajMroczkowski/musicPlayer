const {ipcRenderer} = require('electron')
const sqlite3 = require('sqlite3').verbose();
const fs = require("fs")
const path = require("path");
var settingsLib = require('../settings');
var settings = new settingsLib()
var data = ""
document.getElementById("listDir").value = settings.getObject().list
ipcRenderer.invoke('importDialog').then((result) => {
    if (!result.canceled) {
        data = fs.readFileSync(result.filePaths[0], {encoding: 'utf8', flag: 'r'});
        data = JSON.parse(data)
        var list = document.getElementById("list")
        tbl = document.createElement('table');
        for (const o in data) {
            const tr = tbl.insertRow();
            const check = tr.insertCell();
            const title = tr.insertCell();
            const author = tr.insertCell();
            const name = tr.insertCell();
            var input = document.createElement("input")
            var label = document.createElement("label")
            input.type = "checkbox"
            input.id = data[o].name
            input.checked = true;
            check.appendChild(input)
            title.innerHTML = data[o].title;
            author.innerHTML = data[o].author
            name.innerHTML = data[o].name
            tr.appendChild(check)
            tr.appendChild(title)
            tr.appendChild(author)
            tr.appendChild(name)
            tbl.appendChild(tr)
        }
        list.appendChild(tbl)
    } else {
        location = location
    }
})

function selectDir() {
    ipcRenderer.invoke('openDialog').then((result) => {
        if (!result.canceled) {
            document.getElementById("listDir").value = result.filePaths[0] + "/"
        }
    })

}

function importData() {
    const db = new sqlite3.Database(path.join(settings.location, 'lyrics.db'));
    db.serialize(() => {
        const insert = db.prepare("INSERT INTO list (path,name,title,author) VALUES ('" + document.getElementById('listDir').value + "',?,?,?)");
        for (const o in data) {
            if (document.getElementById(data[o].name).checked) {
                insert.run(data[o].name, data[o].title, data[o].author)
            }
        }
        insert.finalize();
    })
    db.close()
    alert("Importowanie zakończone")

}