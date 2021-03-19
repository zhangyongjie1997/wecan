const fs = require('fs')
const path = require('./path')
const readFile = require('./readFile')
const noop = function () {}

exports.build = async function build(pathConfigs, options = {}, callback = noop) {
    let _errors = []

    var pathConfig
    for (var i = 0; i < pathConfigs.length; i++) {
        pathConfig = pathConfigs[i]
        if (options.direct) {
            let _pathname = path.join(pathConfig.root, pathConfig.output)
            if (fs.existsSync(_pathname)) {
                try {
                    let fileData = fs.readFileSync(_pathname, options)
                    if (fileData) {
                        callback(fileData)
                        return [null, fileData, _pathname]
                    }
                } catch (error) {}
            }
        } else {
            const res = await readFile(pathConfig, options, function (err, data) {
                if (err) {
                    _errors.push(err.message)
                }
                if (data) {
                    callback(data)
                }
            })
            if(res[1]){
                return res
            }
        }
    }
}
