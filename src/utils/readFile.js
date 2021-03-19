const fs = require('fs')
const chalk = require('chalk')
const path = require('./path.js')
const concat = require('./compile/concat.js')
const html = require('./compile/html.js')
const gulpSrc = require('./compile/guleSrc')

const rType = /\.(\w+)$/i

const noop = function (){}
const genError = (file) => new Error('文件或目录不存在:' + file)

/**
 *
 * @param {*} pathConfig output input
 * @param {*} options
 * @param {*} callback
 */
module.exports = async function (pathConfig, options={}, callback=noop) {
    if (typeof pathConfig === 'object' && pathConfig.root && pathConfig.input) {
        const res = await concat(pathConfig, options, function (err, data) {
            callback(err, data, pathConfig.output)
        })
        return [...res, pathConfig]
    } else {
        let type = pathConfig.output.match(rType)

        if (type && type[0]) {
            switch (type[0].toLowerCase()) {
                case '.html': // jade会生成 .html 文件所以不需要特殊处理其他 .htm .shtml .xhtml .dhtml 这些文件
                    const res = await html(pathConfig, options, function (err, data) {
                        callback(err, data, pathConfig.output)
                    })
                    return [...res, pathConfig]
                default:
                    let devDir = pathConfig.config && pathConfig.config.dev_dir ? pathConfig.config.dev_dir : ''
                    let publishDir = pathConfig.config && pathConfig.config.publish_dir ? pathConfig.config.publish_dir : './';

                    let _pathname = path.join(pathConfig.root, devDir || '', pathConfig.output)

                    if (fs.existsSync(_pathname)) {
                        global.efesecho.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname))
                        const res = await gulpSrc(_pathname, pathConfig, publishDir, devDir, options)
                        callback(res[0], res[1], pathConfig.output)
                        return [...res, pathConfig]
                    }

                    _pathname = path.join(pathConfig.root, pathConfig.output)
                    if (fs.existsSync(_pathname)) {
                        const fileData = fs.readFileSync(_pathname)
                        callback(null, fileData, pathConfig.output)
                        return [null, fileData, pathConfig]
                    } else {
                        const err = genError(_pathname)
                        callback(err)
                        return [err, null]
                    }
            }
        } else {
            let _pathname = path.join(pathConfig.root, pathConfig.output)
            if (fs.existsSync(_pathname)) {
                const fileData = fs.readFileSync(_pathname)
                callback(null, fileData, pathConfig.output)
                return [null, fileData, pathConfig]
            } else {
                const err = genError(_pathname)
                callback(err)
                return [err, null]
            }
        }
    }
}
