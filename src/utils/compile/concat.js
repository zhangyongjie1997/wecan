const fs = require('fs')
const chalk = require('chalk')
const through = require('through-gulp')
const path = require('../path.js')
const env = require('../efesEnv.js').env
const gulpBuildJs = require('./gulpBuildJs.js')
const gulpBuildCss = require('./gulpBuildCss')
const noop = function(){}


module.exports = async function (pathname, options, callback=noop) {
    let baseDir = process.cwd()

    if (env && env.baseDir) {
        baseDir = env.baseDir
    }

    let srcs = pathname.input //要合并的文件

    let isPipe = false

    let beforeConcatPipe = through(
        function (file, encoding, callback) {
            this.push(file)
            callback()
        },
        function (callback) {
            callback()
        }
    )

    if (srcs.beforeConcatPipe) {
        isPipe = true
        beforeConcatPipe = require(path.join(pathname.root, srcs.beforeConcatPipe))()
    }

    if (!Array.isArray(srcs) && srcs.input && Array.isArray(srcs.input)) {
        srcs = srcs.input
    }

    srcs = srcs.map(function (src) {
        let _root = pathname.root
        if (src.match(/(^\/|^!\/)/)) {
            _root = baseDir
        }

        let _src = path.join(_root, src)

        if (src.match(/^!/)) {
            // 处理 minimatch 排除规则
            _src = '!' + path.join(_root, src.replace(/^!/, ''))
        }

        if (!src.match(/^!/)) {
            try {
                fs.accessSync(_src)
            } catch (e) {
                console.log(chalk.yellow('文件不存在或为匹配规则：') + _src)
            }
        }

        return _src
    })

    

    let publishDir = pathname.config && pathname.config.publish_dir ? pathname.config.publish_dir : './'

    publishDir = options.outpath || publishDir

    if (/\.css$/i.test(pathname.output)) {
        const [err, res] = await gulpBuildCss(srcs, isPipe, beforeConcatPipe, publishDir, options, pathname)
        callback(err, res)
        return [err, res]
    }

    if (/\.js$/i.test(pathname.output)) {
        const [err, res] = await gulpBuildJs(srcs, isPipe, beforeConcatPipe, publishDir, options, pathname)
        callback(err, res)
        return [err, res]
    }
    return null
}
