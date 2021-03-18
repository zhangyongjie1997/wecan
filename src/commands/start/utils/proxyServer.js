const chalk = require('chalk');
const zlib = require('zlib');
const stream = require('stream');
const mime = require('mime');
const url = require('url');
const epc = require('../../../utils/efesProjectConfigs.js');
const reqMatchToLocalPath = require('../../../utils/reqMatchToLocalPath.js');
const buildResBody = require('../../../utils/buildResBody.js');
const Koa = require('koa')
const app = new Koa();

const rType = /\.(\w+)$/i;

let onRequest = function(request, response, spaceProjectConfigs, spaceInfo, spaceDirname, options) {

  let pathname = url.parse(request.url).pathname;

  if (pathname.match(/\/$/)) {
    pathname = pathname + 'index.html';
  }

  let host = request.headers.host;

  let output = function(code, data) {
    if (data) {
      if (!options.browsersync) {
        let acceptEncoding = request.headers['accept-encoding'];
        if(acceptEncoding && acceptEncoding.indexOf('gzip') != -1) {
          response.writeHeader(code, {
            'Content-Type': pathname.match(rType) ? mime.getType(pathname) : mime.getType('json'),
            'Content-Encoding': 'gzip',
            'Vary': 'Accept-Encoding'
          });

          var raw = new stream.PassThrough();
          raw.end(data);
          raw.pipe(zlib.createGzip()).pipe(response);
        } else {
          response.writeHeader(code, {
            'Content-Type': pathname.match(rType) ? mime.getType(pathname) : mime.getType('json'),
            'Content-Length': Buffer.byteLength(data, 'utf-8')
          });
          response.write(data);
          response.end();
        }
      } else {
        response.write(data);
        response.end();
      }
    } else {
      response.writeHeader(code);
      response.end();
    }
  };

  let projectConfigs = epc.getProjectConfig(host, pathname, spaceInfo, spaceDirname, spaceProjectConfigs);

  let pathConfigs = reqMatchToLocalPath.match(host, pathname, projectConfigs, spaceDirname);

  global.efesecho.log(chalk.bold.green('GET:') + ' http://' + host + pathname);
  buildResBody.build(pathConfigs, options, function(err, filedata, local) {
    //console.log(chalk.grey('Local:' + local));
    
    if (err) {

      global.efesecho.error(chalk.bold.white.bgRed(' ERROR '));

      err.some(function(_err) {
        global.efesecho.error(_err);
      });

      if (filedata) {
        output(502);
      } else {
        output(404);
      }

    } else {
      output(200, filedata);
    }
  });

};

let startServer = function(spaceProjectConfigs, spaceInfo, spaceDirname, options) {
  console.log(app)
  if (options.browsersync) {
    global.bs = require("browser-sync").create();
    global.bs.init({
      port: options.port,
      server: {
        baseDir: "./"
      },
      open: false,
      middleware: function(request, response, next) {
        onRequest(request, response, spaceProjectConfigs, spaceInfo, spaceDirname, options);
      }
    });
    return;
  }

  app.use(async (request, response, next) => {
    onRequest(request, response, spaceProjectConfigs, spaceInfo, spaceDirname, options);
  })

  app.listen(options.port, function(err) {
    if (err) {
      global.efesecho.error(chalk.red('efes本地代理服务启动失败'));
    } else {
      global.efesecho.log('启动成功，监听端口： %s', options.port);
    }
  })

};

module.exports = function(spaceInfo, spaceDirname, options) {

  epc.find(spaceInfo, spaceDirname, function(spaceProjectConfigs){
    // console.log(spaceProjectConfigs);
    startServer(spaceProjectConfigs, spaceInfo, spaceDirname, options);
  });

};

