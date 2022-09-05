const yts = require('yt-search')
const {ipcRenderer} = require('electron')
const ytdl = require("youtube-dl.js");
var settingsLib = require('../settings');
const fs = require("fs");
var settings = new settingsLib()
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

function download(o) {
    o.style.background="rgba(0,0,128,0.4)"
    var r = o.id.split("{[{]")
    document.getElementById(r[1]).innerHTML="Pobieranie...";
    console.log(r[0])
    const fs = require('fs');
    const ytdl = require('ytdl-core');
    var url = r[0]
    var id = ytdl.getURLVideoID(url)
    ytdl.getInfo(id).then(function (value) {
        var stream = ytdl(url,{ filter: 'audioonly', format:"mp3" })
            .pipe(fs.createWriteStream(settings.getObject().list+"/"+value.videoDetails.title+'.mp3'));
        stream.on('finish',()=>{
            document.getElementById(r[1]).innerHTML="Pobrano";
            o.style.background="rgba(0,255,0,0.4)"
        })
    });



}