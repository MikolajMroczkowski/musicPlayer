const https = require("https");
const lyricsFinder = require('lyrics-finder');
var HTMLParser = require('node-html-parser');

class LyricsFinder {
    find(title, author, callback){
        var x = this
        this.findA(title,author,function (v) {
            if(v===false){
                x.findB(title,author,function (vv) {
                  callback(vv,"Tekstowo.pl")
                })
            }
            else{
                callback(v,"Google")
            }
        })
    }
    findA(title, author, callback){
        (async function (artist, title) {
            let lyrics = await lyricsFinder(artist, title) || "err";
            if ("err" === lyrics) {
                callback(false)
            }
            lyrics = lyrics.split('\n')
            callback(lyrics)

        })(author, title);
    }
    findB(title, author, callback) {
        var options = {
            host: 'www.tekstowo.pl',
            port: 443,
            path: encodeURI('/szukaj,wykonawca,' + author.replaceAll(" ", "+") + ',tytul,' + title.replaceAll(" ", "+") + '.html')
        };
        https.get(options, function (resa) {
            var a = "";
            resa.on('data', function (d) {
                a += d;
            });
            resa.on('end', function () {
                var root = HTMLParser.parse(a);
                var optionsa = options
                optionsa.path = root.querySelectorAll('.content')[0].querySelectorAll('.title')[0]._rawAttrs.href;
                https.get(optionsa, function (resb) {
                    var b = ""
                    resb.on('data', function (d) {
                        b += d;
                    });
                    resb.on('end', async function () {
                        var tekst = []
                        var main = HTMLParser.parse(b);
                        var tekstObj = main.querySelectorAll('.inner-text')[0]
                        if (tekstObj.childNodes === undefined) {
                            return
                        }
                        for (var x = 0; x < tekstObj.childNodes.length; x++) {
                            if (tekstObj.childNodes[x]._rawText !== undefined) {
                                tekst.push(tekstObj.childNodes[x]._rawText);
                            }
                        }
                        callback(tekst)
                    });
                }).on('error',function () {
                    callback(false)
                })

            });
        }).on('error', function (e) {
            callback(false)
        })

    }
}
module.exports=LyricsFinder