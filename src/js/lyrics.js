var cache = "";
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const LyricsFinder = require("../lyrics")
var settingsLib = require('../settings');
var settings = new settingsLib()
const lyricsFinder = new LyricsFinder;


function init() {
    const db = new sqlite3.Database(path.join(settings.location, 'lyrics.db'));

    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS list( id integer constraint table_name_pk primary key autoincrement unique, path text, name text, title text, author text );");
    });

    db.close();
}

function reFetchLyrics() {
    var listi = document.getElementById("randomize").checked ? randomized : list
    if (cache !== listi[np]) {
        const db = new sqlite3.Database(path.join(settings.location, 'lyrics.db'));
        document.getElementById("lyricsBox").innerHTML = "Trwa Wczytywanie...<br>Upewnij się że dowiązanie jest poprawne"
        db.serialize(() => {
            db.each("SELECT * FROM list WHERE path='" + listPath + "' AND name = '" + listi[np].replaceAll("'", '"') + "'", (err, row) => {
                cache = listi[np]
                lyricsFinder.find(row.title, row.author, function (v,source) {
                    document.getElementById("lyricsBox").innerHTML = ""
                    if (v === false) {
                        document.getElementById("lyricsBox").innerText = "tekst nie został odnaleziony"
                    } else {
                        for (let i = 0; i < v.length; i++) {
                            document.getElementById("lyricsBox").innerHTML += v[i] + "<br>"
                        }
                        document.getElementById("lyricsBox").innerHTML += "<br>"
                        document.getElementById("lyricsBox").innerHTML += "<i>Źródło: "+source+"</i>"
                        document.getElementById("lyricsBox").innerHTML += "<br>"
                        document.getElementById("lyricsBox").innerHTML += "<br>"

                    }
                })
            });
        });
        db.close();

    }

}

function toggleLyrics() {
    console.log()
    if (document.getElementById("lyricsBox").style.display !== "block") {
        document.getElementById("lyricsBox").style.display = "block"
        document.getElementById("lyricsBtn").innerText = "Ukryj tekst"
        reFetchLyrics()
    } else {
        document.getElementById("lyricsBox").style.display = "none"
        document.getElementById("lyricsBtn").innerText = "Pokaż tekst"
    }

}

init()