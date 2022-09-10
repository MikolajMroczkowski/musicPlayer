var fs = require('fs')
const sqlite3 = require('sqlite3').verbose();
var settingsLib = require('../settings');
const path = require("path");
var settings = new settingsLib()
var listPath = settings.getObject().list;
var tempList = []

const db = new sqlite3.Database(path.join(settings.location, 'lyrics.db'));
db.serialize(() => {
    var select = document.getElementById("choseList")
    db.each("SELECT path FROM list GROUP BY path", (err, row) => {
        var option = document.createElement("option")
        option.innerText = row.path
        option.value = row.path
        select.appendChild(option)
    });
    setTimeout(function () {
        select.value=settings.getObject().list
        init()
    },200)
    select.onchange=(ev)=>{
        listPath = document.getElementById('choseList').value
        init()
    }
});
db.close();

function init(){
    fs.readdir(listPath, function (err, fn) {
        var x = 0;
        var list = document.getElementById("list")
        list.innerHTML=""
        tempList=[]
        for (let i = 0; i < fn.length; i++) {
            if (fn[i].includes("mp3")) {
                tempList.push(fn[i])
                var div = document.createElement("div");
                var inputInfo = document.createElement("input");
                var inputTitle = document.createElement("input");
                var inputAuthor = document.createElement("input");
                inputInfo.classList.add("max")
                inputTitle.classList.add("min")
                inputAuthor.classList.add("min")
                div.id = x
                inputTitle.id=x+"T"
                inputAuthor.id=x+"A"
                inputInfo.value=fn[i]
                inputInfo.disabled=true;
                inputTitle.placeholder="Tytuł..."
                inputAuthor.placeholder="Autor..."
                div.appendChild(inputInfo)
                div.appendChild(inputTitle)
                div.appendChild(inputAuthor)
                list.appendChild(div);
                x++;
            }
        }
        for (let i = 0; i < tempList.length; i++) {
            const db = new sqlite3.Database(path.join(settings.location,'lyrics.db'));
            db.serialize(() => {
                db.each("SELECT * FROM list WHERE path='"+listPath+"' AND name = '"+tempList[i].replaceAll("'",'"')+"'", (err, row) => {
                    if(err) return err
                    var inputTitle = document.getElementById(i+"T");
                    var inputAuthor = document.getElementById(i+"A");
                    inputTitle.value = row.title
                    inputAuthor.value = row.author
                    document.getElementById(i).style.background="rgba(0,255,0,0.3)"
                });
            });
            db.close();
        }
    })
}
function save() {
    const db = new sqlite3.Database(path.join(settings.location,'lyrics.db'));
    db.serialize(() => {
        const insert = db.prepare("INSERT INTO list (path,name,title,author) VALUES ('"+listPath+"',?,?,?)");
        const update = db.prepare("UPDATE list SET title=?, author=? WHERE path='"+listPath+"' AND name = ?");
        for (let i = 0; i < tempList.length; i++) {
            db.each("SELECT COUNT(*) as 'num' FROM list WHERE path='" + listPath + "' AND name = '" + tempList[i].replaceAll("'", '"') + "'", (err, row) => {
                var title = document.getElementById(i + "T").value
                var author = document.getElementById(i + "A").value
                if(title!==""&&author!=="") {
                    console.log(row.num,title,author)
                    if (row.num === 0) {
                        insert.run(tempList[i].replaceAll("'", '"'), title, author)

                    } else {
                        update.run(title, author, tempList[i].replaceAll("'", '"'))
                        console.log(title, author, tempList[i].replaceAll("'", '"'))

                    }
                }
            });
        }
        setTimeout(function () {
            insert.finalize();
            update.finalize();
            location=location
        },750)
    });
}