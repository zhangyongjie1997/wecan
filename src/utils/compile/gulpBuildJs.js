const es2015 = require('babel-preset-es2015')
const react = require('babel-preset-react')
const rJsFile = /\.(babel|es6|es2015|jsx|js|coffee)$/i
const rBabel = /\.(babel|es6|es2015)$/i
const rJsx = /\.jsx$/i
const rCoffee = /\.coffee$/i
const babelCompile = require('./babel.js')
const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const through = require('through-gulp')



module.exports = function gulpBuildJs(srcs, isPipe, beforeConcatPipe, publishDir, options, pathname) {
    return new Promise((resolve) => {
        gulp.src(srcs)
            .pipe($.plumber())
            .pipe(
                $.if(
                    rBabel,
                    babelCompile({
                        presets: [es2015],
                    })
                )
            )
            .pipe(
                $.if(
                    rJsx,
                    babelCompile({
                        presets: [es2015, react],
                    })
                )
            )
            .pipe($.if(rCoffee, $.coffee()))
            .pipe($.if(isPipe, beforeConcatPipe))
            .pipe(
                $.if(
                    !options.publish,
                    through(function (file, enc, cb) {
                        let contents = file.contents.toString()
                        let _path = file.history && file.history[0]

                        contents = '/** SOURCE: ' + _path + '  **/\n\n\n' + contents + '\n\n\n'
                        // global.efesecho.log(chalk.yellow('src:') + ' ' + chalk.grey(_path));

                        if (!_path.match(rJsFile)) {
                            contents = ''
                            console.log(chalk.yellow('非js文件：') + _path)
                        }

                        file.contents = new Buffer(contents)
                        return cb(null, file)
                    })
                )
            )
            .pipe($.concat(pathname.output))
            .pipe($.if(options.compress, $.uglify()))
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
                through(function (file, enc, cb) {
                    resolve([null, file.contents])
                    return cb(null, file)
                })
            )
    })
}
