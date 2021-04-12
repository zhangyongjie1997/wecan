const gulp = require('gulp')
const fs = require('fs')
const chalk = require('chalk')

const $ = require('gulp-load-plugins')()
const through = require('through-gulp')

const path = require('../path.js')

module.exports = function buildHtml(pathname, options, callback) {
    return new Promise((resolve) => {
        if (!pathname.config) {
            let _pathname = path.join(pathname.root, pathname.output)
            if (fs.existsSync(_pathname)) {
                gulp.src(_pathname).pipe(
                    through(function (file) {
                        callback(null, file.contents)
                        resolve([null, file.contents])
                        return file
                    })
                )
            } else {
                const err = new Error('文件或目录不存在:' + _pathname)
                callback(err)
                resolve([err, null])
            }
            return
        }

        // 寻找开发目录下的jade文件

        let devDir = pathname.config && pathname.config.dev_dir ? pathname.config.dev_dir : ''
        let publishDir = pathname.config && pathname.config.publish_dir ? pathname.config.publish_dir : './'

        publishDir = options.outpath || publishDir

        let _pathname = path.join(pathname.root, devDir || '', pathname.output.replace(/\.html$/i, '.jade'))

        if (fs.existsSync(_pathname)) {
            console.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname))
            return gulp
                .src(_pathname)
                .pipe($.plumber())
                .pipe(
                    $.jade({
                        pretty: true,
                    })
                )
                .on('error', $.util.log)
                .pipe(
                    $.if(
                        options.publish && pathname.config,
                        gulp.dest(publishDir, {
                            cwd: pathname.root,
                        })
                    )
                )
                .pipe(
                    through(function (file) {
                        callback(null, file.contents)
                        resolve([null, file.contents])
                        return file
                    })
                )
        }

        // 寻找开发目录下的html文件
        _pathname = path.join(pathname.root, devDir || '', pathname.output)

        // 寻找发布目录下的html文件
        if (fs.existsSync(_pathname)) {
            console.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname))
            gulp.src(_pathname, {
                base: path.join(pathname.root, devDir || ''),
            })
                .pipe(
                    $.if(
                        options.publish && pathname.config,
                        gulp.dest(publishDir, {
                            cwd: pathname.root,
                        })
                    )
                )
                .pipe(
                    through(function (file) {
                        callback(null, file.contents)
                        resolve([null, file.contents])
                        return file
                    })
                )
            return
        }

        _pathname = path.join(pathname.root, pathname.config.publish_dir || '', pathname.output)

        if (fs.existsSync(_pathname)) {
            console.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname))
            gulp.src(_pathname).pipe(
                through(function (file) {
                    callback(null, file.contents)
                    resolve([null, file.contents, _pathname])
                    return file
                })
            )
        } else {
            const err = new Error('文件或目录不存在:' + _pathname)
            callback(err)
            resolve([err, null])
        }
    }).catch(err => {
      callback(err)
      return [err, null]
    })
}
