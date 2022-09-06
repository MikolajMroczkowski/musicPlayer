const sqlite3 = require('sqlite3').verbose();
var settingsLib = require('../settings');
var settings = new settingsLib()
const fs = require('fs');
const ytdl = require('ytdl-core');

const yts = require('yt-search')
const {ipcRenderer} = require('electron')
const path = require("path");
document.getElementById("query").addEventListener('keypress',function (ev) {
    if(ev.key==='Enter'){
        search()
    }
})
async function search() {

    var el = document.getElementById("list")
    el.innerHTML = ""
    const r = await yts(document.getElementById("query").value)
    const videos = r.videos.slice(0, 10)
    videos.forEach(function (v) {
        var tag = document.createElement("div")
        var img = document.createElement("img")
        var status = document.createElement("p")
        img.src = v.thumbnail
        img.style.width = "400px"
        var title = document.createElement("h2")
        title.innerHTML = v.title
        status.id = v.title
        tag.appendChild(img)
        tag.appendChild(title)
        tag.appendChild(status)
        tag.id = v.url + "{[{]" + v.title
        tag.onclick = function () {
            download(this)
        }
        tag.classList.add("el")

        el.appendChild(tag)

    })
}
var file = ""
function download(o) {
    o.style.background = "rgba(0,0,128,0.4)"
    var r = o.id.split("{[{]")
    document.getElementById(r[1]).innerHTML = "Pobieranie...";
    var url = r[0]
    var id = ytdl.getURLVideoID(url)
    ytdl.getInfo(id).then(function (value) {
        file = value.videoDetails.title + '.mp3'

        var stream = ytdl(url, {filter: 'audioonly', format: "mp3"})
            .pipe(fs.createWriteStream(settings.getObject().list + "/" + value.videoDetails.title + '.mp3'));
        stream.on('finish', () => {
            document.getElementById(r[1]).innerHTML = "Pobrano";
            o.style.background = "rgba(0,255,0,0.4)"

            var ref = settings.getObject().autoReference
            console.log(ref)
            if (ref === "ask") {
                var answer = window.confirm("Czy chcesz utworzyć dowiązanie?");
                if (answer) {
                    reference()
                }
            }
            if (ref === "yes") {
                reference()
            }
        })
        stream.on('error', () => {
            document.getElementById(r[1]).innerHTML = "Błąd";
            o.style.background = "rgba(255,0,0,0.4)"
        })


    });

}
function reference() {

    document.getElementById("modal").style.display = "flex"

}
function save() {
    var title = document.getElementById('title').value
    var author = document.getElementById('author').value
    const db = new sqlite3.Database(path.join(settings.location, 'lyrics.db'));
    db.serialize(() => {
        const insert = db.prepare("INSERT INTO list (path,name,title,author) VALUES ('"+settings.getObject().list+"',?,?,?)");
        insert.run(file,title,author)
        insert.finalize();
    })
    db.close()
    document.getElementById('modal').style.display = 'none'
    alert("dodano")
}
