'use strict';

var gulp = require('gulp');

// Load plugins
var $ = require('gulp-load-plugins')();

gulp.task('clean', require('del').bind(null, ['dist']));

/* es6 */
gulp.task('es6', function() {
  return gulp.src(['src/**/*.js','!src/commands/scaffold/template/**/*.js', '!src/libs/**/*.js'])
    .pipe($.plumber())
    .pipe($.babel({
      presets: ['es2015']
    }))
    .on('error', $.util.log)
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', function(done){

  gulp.src(['!src/**/*.js','src/**/*'])
    .pipe(gulp.dest('dist'));

  gulp.src(['src/commands/scaffold/template/**/*'])
    .pipe(gulp.dest('dist/commands/scaffold/template'));
    done()
});

gulp.task('watch', gulp.series('es6', 'copy'), function(done) {

  gulp.watch(['src/**/*.*'], gulp.series('es6', 'copy'));
  done()

});

gulp.task('build',gulp.series('es6', 'copy'), done => {
  done()
});

gulp.task('default', gulp.series('clean'), function(done) {

  gulp.start('watch');

});
