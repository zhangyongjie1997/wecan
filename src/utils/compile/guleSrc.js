const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const path = require('../path.js');
const through = require('through-gulp')

module.exports = async function gulpBuildSrc(_pathname, pathConfig, publishDir, devDir, options) {
    return new Promise(resolve => {
        gulp.src(_pathname, {
            base: path.join(pathConfig.root, devDir || ''),
        })
            .pipe(
                $.if(
                    options.publish && pathConfig.config,
                    gulp.dest(publishDir, {
                        cwd: pathConfig.root,
                    })
                )
            )
            .pipe(
                through(function (file) {
                    resolve([null, file.contents])
                    return file
                })
            )
    }).catch(err => {
        debugger
        return [err, null]
    })
}