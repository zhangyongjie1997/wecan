"use strict";
  const chalk = require('chalk');
  const gulp = require('gulp');
  const fs = require('fs');
  const childProcess = require('child_process');
  const async = require('async');
  const through2 = require('through2');
  const $ = require('gulp-load-plugins')();
  const tinypng_nokey = require('gulp-tinypng-nokey');    //压缩图片3 免费

  const fsp = require('../../../utils/fs.js');
  const path = require('../../../utils/path.js');

  // const work = require('../../../utils/efesWorkspace.js');

  const buildResBody = require('../../../utils/buildResBody.js');

  function copyFile(){
    return through2.obj(function(file, enc, callback){
      callback(null, file);
    });
  }

  const echoLog = function(file) {
    global.efesecho.log(chalk.green('发布：'), file.relative || file.path);
    return true;
  };

  const step2 = function(dirname, config, publishDir, options) {
    global.efesecho.log(chalk.green('开始压缩图片...'));
    // 第二步处理图片 压缩
    gulp.src([path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)',
        "!" + path.join(dirname, config.dev_dir) + '/**/icons/*.png'
      ])
      .pipe(copyFile())
      .on('error', function(){
        console.log(arguments)
      })
      .on('end', function() {
        step3(dirname, config, publishDir, options);
      })
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));
  };

  const step3 = function(dirname, config, publishDir, options) {
    global.efesecho.log(chalk.green('开始编译jade文件...'));
    // 第三步处理jade
    gulp.src(path.join(dirname, config.dev_dir) + '/**/*.jade')
      .pipe($.plumber())
      .pipe($.jade({
        pretty: true
      }))
      .on('error', $.util.log)
      .on('end', function() {
        step4(dirname, config, publishDir, options);
      })
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));

  };

  const step4 = function(dirname, config, publishDir, options) {
    global.efesecho.log(chalk.green('开始复制处理其他文件...'));

    const condition = function(file) {
      if (!options.publish || !config || fs.statSync(file.path).isDirectory()) {
        return false;
      }
      global.efesecho.log(chalk.green('发布：'), file.relative || file.path);
      return true;
    };

    // 第四步处理其他文件
    let concatfile = fsp.readJSONSync(path.join(dirname, 'concatfile.json'));
    let outPublishFile = '/**/*.+(jsx|less|sass|scss|coffee|babel|es2015|es6)';
    if (concatfile) {
      outPublishFile = '/**/*.+(js|css|jsx|less|sass|scss|coffee|babel|es2015|es6)';
    }
    gulp.src([
        path.join(dirname, config.dev_dir) + '/**/*',
        "!" + path.join(dirname, config.dev_dir) + outPublishFile,
        "!" + path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)',
        "!" + path.join(dirname, config.dev_dir) + '/**/icons/*.png',
        "!" + path.join(dirname, config.dev_dir) + '/**/*.jade',
      ])
      .on('end', function() {
        step5(options);
      })
      .pipe($.if(condition, gulp.dest(publishDir, {
        cwd: dirname
      })));
  };

  const step5 = function(options) {
    if (options.all || options.message) {
      global.efesecho.log(chalk.green('开始提交git仓库...'));
      let _cmd = 'git commit -am ' + options.message;
      if (!options.all) {
        _cmd = 'git commit -m ' + options.message;
      }

      if (!options.message) {
        _cmd = 'git commit -a';
      }

      try {
        let stdout = childProcess.execSync(_cmd, {
          stdio: 'inherit'
        });
      } catch(e) {
        global.efesecho.log(e);
      }
    }
  };

  module.exports = function(dirname, options) {

    let config = fsp.readJSONSync(path.join(dirname, '.efesconfig'));
    let concatfile = fsp.readJSONSync(path.join(dirname, 'concatfile.json'));

    let publishDir = config.publish_dir || './';

    publishDir = options.outpath || publishDir;

    // 第零步处理css、js
    if (concatfile.pkg) {
      global.efesecho.log(chalk.green('开始编译、合并js、css文件...'));
      async.forEachOfSeries(concatfile.pkg, function(input, output, cb) {
        buildResBody.build([{
          root: dirname,
          output: output,
          input: input,
          config: config
        }], options, function(err, filedata, local) {
          global.efesecho.log(chalk.green('发布：'), output);
          cb();
        });

      }, function(err) {
        err && config.log(err);
        step2(dirname, config, publishDir, options);
      });

    } else {
      step2(dirname, config, publishDir, options);
    }

  };

