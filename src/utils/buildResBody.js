const fs = require('fs')
const async = require('async')
const path = require('./path')
const readFile = require('./readFile')


exports.build = function build(pathConfigs, options, callback) {
    
  let _data, _errors = [];

  async.eachSeries(pathConfigs, function iterator(pathConfig, cb) {
    if (options.direct) {
      let _pathname = path.join(pathConfig.root, pathConfig.output);
      fs.readFile(_pathname, options, function(err, data) {
        if (err) {
          errors.push(err.message);
          cb();
        }
        if (data) {
          callback(null, data, _pathname);
          cb();
        }
      });
    } else {
      readFile(pathConfig, options, function(err, data) {
        if (err) {
          _errors.push(err.message);
          cb();
        }
        if (data) {
          _data = data;
          callback(null, data, pathConfig);
          cb();
        }
      });
    }
  }, function() {
    if (!_data && _errors.length > 0) {
      callback(_errors);
    }
  });
};