const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const rCssFile = /\.(less|css)$/i
const rLess = /\.less$/i
const through = require('through-gulp')


let browsers = ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']

module.exports = function gulpBuildCss(srcs, isPipe, beforeConcatPipe, publishDir, options, pathname) {
    return new Promise((resolve) => {
        gulp.src(srcs)
            .pipe($.plumber())
            .pipe($.if(rLess, $.less()))
            .pipe(
                $.postcss([
                    require('autoprefixer')({
                        browsers: browsers,
                    }),
                ])
            )
            .pipe($.if(isPipe, beforeConcatPipe))
            .pipe(
                $.if(
                    !options.publish,
                    through(function (file, enc, cb) {
                        let contents = file.contents.toString()
                        let _path = file.history && file.history[0]

                        contents = '\n\n\n /** SOURCE: ' + _path + '  **/\n\n\n' + contents
                        // global.efesecho.log(chalk.yellow('src:') + ' ' + chalk.grey(_path));

                        if (!_path.match(rCssFile)) {
                            contents = ''
                            console.log(chalk.yellow('非css文件：') + _path)
                        }

                        file.contents = new Buffer(contents)
                        return cb(null, file)
                    })
                )
            )
            .pipe($.concat(pathname.output))
            .pipe($.if(options.compress, $.postcss([require('cssnano')()])))
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
                    resolve([null, file.contents])
                    return file
                })
            )
    })
}
