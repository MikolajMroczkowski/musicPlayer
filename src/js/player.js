var fs = require('fs')
var a = document.getElementById("audio")
var settingsLib = require('../settings');
var settings = new settingsLib()
var listPath = settings.getObject().list;
var autoplay = settings.getObject().autoplay;
a.preservesPitch = false
pbr = 1
np = 0;
var randomized = []
var list = []
if(listPath===undefined){
    listPath="./music/";
}
setInterval(reload,5000)
function reload() {
    fs.readdir(listPath, function (err, fn) {
        var tempList = []
        for (let i = 0; i < fn.length; i++) {
            if (fn[i].includes("mp3")) {
                tempList.push(fn[i])

            }
        }
        if(diffArray(tempList,list).length>0){
            console.log("Reloading...")
            randomized = tempList
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
            var listi = document.getElementById("randomize").checked ? randomized : list
            var playing = tempList.indexOf(listi[np])
            var element = document.getElementById("list");
            element.innerHTML=""
            list=tempList
            for (let i = 0; i < tempList.length; i++) {
                var tag = document.createElement("p");
                tag.innerHTML = tempList[i]
                tag.onclick = function () {
                    play(this.id.replaceAll("el", ""))
                }
                tag.classList.add("el")
                tag.id = "el" + (i)

                element.appendChild(tag);
            }
            var el = document.getElementById("el" + playing)
            el.classList.add("np")
            el.classList.remove("el")
        }

    })
}

fs.readdir(listPath, function (err, fn) {

    for (let i = 0; i < fn.length; i++) {
        if (fn[i].includes("mp3")) {
            list.push(fn[i])
            var tag = document.createElement("p");
            tag.innerHTML = fn[i]
            tag.onclick = function () {
                var a = document.getElementById("randomize").checked ? randomized.indexOf(list[this.id.replaceAll("el", "")]) : this.id.replaceAll("el", "")
                play(a)
            }
            tag.classList.add("el")
            tag.id = "el" + (list.length - 1)
            var element = document.getElementById("list");
            element.appendChild(tag);

        }
    }
    if(list.length===0){
        var tag = document.createElement("h1");
        tag.innerHTML = "Lista jest pusta";
        var element = document.getElementById("list");
        element.appendChild(tag);
        return
    }
    randomized = list
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    a.volume=settings.getObject().volume/100
    pbr=settings.getObject().speed
    document.getElementById("volume").value=settings.getObject().volume
    document.getElementById("speed").value=settings.getObject().speed*100
    document.getElementById("randomize").checked=settings.getObject().randomize
    document.getElementById("repeat").checked=settings.getObject().repeat
    document.getElementById("volumeVal").innerHTML = a.volume * 100
    document.getElementById("speedVal").innerHTML = pbr
    if(autoplay){
        if(settings.getObject().lastPlay<list.length){
            play(settings.getObject().lastPlay)
        }
        else{
            var willPlay = getRandomInt(0, list.length)
            play(willPlay)
        }

    }

})
a.onended = function () {
    if (!document.getElementById("repeat").checked) {
        next()
    } else {
        play(np)
    }
}

function play(id) {
    var listi = document.getElementById("randomize").checked ? randomized : list
    for (let i = 0; i < listi.length; i++) {
        document.getElementById("el" + i).classList.remove("np")
        document.getElementById("el" + i).classList.add("el")
    }
    np = parseInt(id);
    a.src = "file://"+listPath+listi[np]
    a.play()
    a.playbackRate = pbr
    var el = document.getElementById("el" + list.indexOf(listi[id]))
    el.classList.add("np")
    el.classList.remove("el")
    document.getElementById("np").innerHTML=listi[np].replace(".mp3","")
    document.getElementById("duration").innerHTML = secondsToMinSec(parseInt(a.duration))
    settings.lastPlay(list.indexOf(listi[np]))
    reFetchLyrics()
    barRefresh(listi[np].replace(".mp3",""),"")
}

function next() {
        if (list.length === np + 1) {
            play(0)
        } else {
            play(np + 1)
        }


}

function previous() {

    if (a.currentTime < 3) {
        if (np - 1 < 0) {
            play(list.length - 1)
        } else {
            play(np - 1)
        }

    } else {
        a.currentTime = 0;
    }

}

function pause() {
    var p = document.getElementById("pause")
    if (a.paused) {
        a.play()
        p.innerHTML = "Pause"
    } else {
        a.pause()
        p.innerHTML = "Play"
    }
}

setInterval(function () {
    document.getElementById("mainAudio").value = parseInt((a.currentTime / a.duration) * 1000)
    document.getElementById("currentTime").innerHTML = secondsToMinSec(parseInt(a.currentTime))
    document.getElementById("duration").innerHTML = secondsToMinSec(parseInt(a.duration))
}, 200)

document.getElementById("mainAudio").onchange = function (ev) {
    console.log((parseInt(document.getElementById("mainAudio").value) / 1000) * a.duration)
    a.currentTime = (parseInt(document.getElementById("mainAudio").value) / 1000) * a.duration
}

document.getElementById("speed").onchange = function (ev) {
    a.playbackRate = document.getElementById("speed").value / 100
    pbr = a.playbackRate
    document.getElementById("speedVal").innerHTML = a.playbackRate
    settings.setSpeed(pbr)
}
function speed(val){
    a.playbackRate=a.playbackRate+val
    document.getElementById("speed").value = a.playbackRate*100
    pbr = a.playbackRate
    document.getElementById("speedVal").innerHTML = a.playbackRate
}
document.getElementById("volume").onchange = function (ev) {
    a.volume = document.getElementById("volume").value / 100
    document.getElementById("volumeVal").innerHTML = a.volume * 100
    settings.setVolume(a.volume * 100)
}
document.getElementById("randomize").onchange=function (ev) {
    var o = settings.getObject()
    o.randomize = document.getElementById("randomize").checked
    settings.saveObject(o)
    randomized = list
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}
document.getElementById("repeat").onchange=function (ev) {
    var o = settings.getObject()
    o.repeat = document.getElementById("repeat").checked
    settings.saveObject(o)
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const padTime = n => ("" + n).padStart(2, 0);
const secondsToMinSec = time =>
    `${padTime(~~(time / 60))}:${padTime(time - ~~(time / 60) * 60)}`
;

function diffArray(arr1, arr2) {
    const newArr = [];

// arr1 match to arr2
    arr1.map((item)=>{
        if(arr2.indexOf(item)<0){
            console.log(item)
            newArr.push(item)
        }
    })

// arr2 match to arr1
    arr2.map((item)=>{
        if(arr1.indexOf(item)<0){
            newArr.push(item)
        }
    })

    return newArr;
}
function barRefresh(title, author) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: author,
            album: 'Prędkość: '+pbr+"x"
        });

        navigator.mediaSession.setActionHandler('play', function() { pause() });
        navigator.mediaSession.setActionHandler('pause', function() { pause() });
        navigator.mediaSession.setActionHandler('stop', function() { /* Code excerpted. */ });
        navigator.mediaSession.setActionHandler('seekbackward', function() { speed(-0.1) });
        navigator.mediaSession.setActionHandler('seekforward', function() { speed(0.1) });
        navigator.mediaSession.setActionHandler('seekto', function() { /* Code excerpted. */ });
        navigator.mediaSession.setActionHandler('previoustrack', function() { previous() });
        navigator.mediaSession.setActionHandler('nexttrack', function() { next() });
    }
}