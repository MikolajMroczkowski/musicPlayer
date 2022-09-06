var path = require('path')
const sqlite3 = require('sqlite3').verbose();
const {ipcRenderer} = require('electron')
var settingsLib = require('../settings');
const fs = require("fs");
var settings = new settingsLib()
var url = new URL(location.href)
if (url.searchParams.has("list")) {
    const db = new sqlite3.Database(path.join(settings.location, 'lyrics.db'));
    var bigObj = []
    db.serialize(() => {
        db.each("SELECT name,title,author FROM list WHERE path='" + url.searchParams.get("list") + "'", (err, row) => {
            bigObj.push(row)
        });
    });
    db.close();
    setTimeout(function () {
        ipcRenderer.invoke('saveDialog').then((result) => {
            if (!result.canceled) {
                fs.writeFile(result.filePath, JSON.stringify(bigObj), 'utf-8', function (err) {
                    if (err) return alert(err);
                    alert("Zapisano Dane")
                    url.searchParams.delete("list")
                    location.href = url.href
                })

            }
        })
    }, 100)

} else {
    const db = new sqlite3.Database(path.join(settings.location, 'lyrics.db'));
    db.serialize(() => {
        db.each("SELECT path FROM list GROUP BY path", (err, row) => {
            var el = document.getElementById("list")
            var tag = document.createElement("p")
            tag.id = row.path
            tag.onclick = function () {
                useList(this.id)
            }
            tag.innerText = row.path
            el.appendChild(tag)
        });
    });
    db.close();
}

function useList(list) {
    url.searchParams.append("list", list)
    location.href = url.href
}
