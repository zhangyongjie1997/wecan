const fs = require('fs')
const path = require('./path')
const readFile = require('./readFile')
const noop = function () {}

exports.build = async function build(pathConfigs, options = {}, callback = noop) {
    let _errors = []

    let pathConfig
    for (var i = 0; i < pathConfigs.length; i++) {
        pathConfig = pathConfigs[i]
        if (options.direct) {
            let _pathname = path.join(pathConfig.root, pathConfig.output)
            if (fs.existsSync(_pathname)) {
                global.efesecho.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname))
                try {
                    let fileData = fs.readFileSync(_pathname, options)
                    if (fileData) {
                        callback(fileData)
                        return [null, fileData, pathConfig]
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
    return [_errors, null]
}
