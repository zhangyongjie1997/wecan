var fs = require('fs')
var path = require('path')

var regInclude = function (file, rIncludes) {
    if (!rIncludes || rIncludes.length < 1) {
        return true
    }
    var len = rIncludes.length
    var i = 0
    for (; i < len; i++) {
        if (file.match(rIncludes[i])) {
            return true
        }
    }
    return false
}

var regExclude = function (root, rExcludes, rIncludes, done) {
    var inResults = []

    var list = fs.readdirSync(dir)

    var pending = list.length

    if (!pending) return done(null, inResults)

    list.forEach(function (file) {
        file = path.join(dir, file)

        var excluded = false

        if (rExcludes && rExcludes.length > 0) {
            var len = rExcludes.length
            var i = 0
            for (; i < len; i++) {
                if (file.match(rExcludes[i])) {
                    excluded = true
                }
            }
        }

        if (excluded === false) {
            if (regInclude(file, rIncludes)) {
                inResults.push(file)
            }

            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    regExclude(file, rExcludes, rIncludes, function (err, inres) {
                        inResults = inResults.concat(inres)
                        if (!--pending) {
                            done(null, inResults)
                        }
                    })
                } else {
                    if (!--pending) {
                        done(null, inResults)
                    }
                }
            })
        } else {
            if (!--pending) {
                done(null, inResults)
            }
        }
    })
}


class Lookup {
    root = ''
    rIncludes = []
    rExcludes = []
    results = []
    constructor(root, rExcludes, rIncludes) {
        this.root = root || []
        this.rExcludes = rExcludes || []
        this.rIncludes = rIncludes || []
    }

    lookup() {
        this.__walk(this.root)
        return this.results
    }

    __walk(root) {
        const dirs = fs.readdirSync(root)

        if (!dirs.length) return

        dirs.forEach((dir) => {
            dir = path.join(root, dir)

            const isExcluded = this.rExcludes.some((r) => {
                if (dir.match(r)) {
                    return true
                }
            })
            if (isExcluded) return

            this.rIncludes.some((r) => {
                if (dir.match(r)) {
                    this.results.push(dir)
                    return true
                }
            })

            const stat = fs.statSync(dir)
            if(stat && stat.isDirectory()){
                this.__walk(dir)
            }

        })
    }
}

/**
 * 
 * @param {*} root 
 * @param {*} rExcludes 
 * @param {*} rIncludes 
 * @returns 
 */
var lookup = function (root, rExcludes, rIncludes) {
    return new Lookup(root, rExcludes, rIncludes).lookup()
}

module.exports = lookup

function findAllEfesConfigs(spaceDirname, callback) {
    let regExcludes = [/node_modules/, /\.git/, /\.tmp/, /\.DS_Store/]
    let regIncludes = [/\.efesconfig$/i]
    // 查找到efes工作空间下面所有含有 .efesconfig 的目录
    regexfiles(spaceDirname, regExcludes, regIncludes, function (err, subfiles) {
        if (err) {
            global.efesecho.log(chalk.red(err.message))
            callback(subfiles)
            return
        }
        callback(subfiles)
    })
}
