const fs = require('fs');
const path = require("path");
const {ipcRenderer,app} = require('electron')


class Settings {
    location = ""
    constructor() {
        if(process && process.type === 'renderer'){
            this.location = ipcRenderer.sendSync('userData')
        }
        else {
            this.location=app.getPath('userData')
        }
        this.checkFile()
    }

    checkFile() {
        if (!fs.existsSync(path.join(this.location, "settings.json"))) {


            let data = '{"list":"' + path.join("music/") + '","autoplay":false,"volume":100,"speed":1,"lastPlay":0,"reference":"yes"}'

            fs.writeFileSync(path.join(this.location, "settings.json"), data);
        }
    }

    lastPlay(id) {
        var o = this.getObject()
        o.lastPlay = id
        this.saveObject(o)
    }

    setVolume(lvl) {
        var o = this.getObject()
        o.volume = lvl
        this.saveObject(o)
    }

    setSpeed(lvl) {
        var o = this.getObject()
        o.speed = lvl
        this.saveObject(o)
    }

    getObject() {
        this.checkFile()
        const data = fs.readFileSync(path.join(this.location, "settings.json"),
            {encoding: 'utf8', flag: 'r'});
        return JSON.parse(data)
    }

    saveObject(obj) {
        var data = JSON.stringify(obj)
        fs.writeFileSync(path.join(this.location, "settings.json"), data);
    }
}

module.exports = Settings