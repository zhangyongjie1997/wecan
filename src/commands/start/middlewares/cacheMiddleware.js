const { ModuleGraph } = require('../moduleGraph')
const epc = require('../../../utils/efesProjectConfigs')
const reqMatchToLocalPath = require('../../../utils/reqMatchToLocalPath')
const { build } = require('../../../utils/buildResBody')
const moduleGraph = new ModuleGraph()
module.exports = function (allConfigs, workSpaceConfig, workSpaceDirname, options) {
    return async function cacheMiddleware(request, response, next) {
        const { pathname, host, id } = request.context
        const cache = moduleGraph.searchModuleById(id)
        if(cache !== null && cache !== undefined) {
            request.context.sourceUrl = cache
            request.context.useCache = true
            next()
        } else {
            
            const projectConfigs = epc.getProjectConfig(host, pathname, workSpaceConfig, workSpaceDirname, allConfigs);
            const pathConfigs = reqMatchToLocalPath.match(host, pathname, projectConfigs, workSpaceDirname);
            const [error, fileData, filePath] = await build(pathConfigs, options).catch(err => {debugger;console.log(err)})
            if (error) {

                global.efesecho.error(chalk.bold.white.bgRed(' ERROR '));
          
                error.some(function(_err) {
                  global.efesecho.error(_err);
                });
          
                if (fileData) {
                    request.context.code = 502
                } else {
                    request.context.code = 404
                }
          
            } else {
                moduleGraph.addModule(request.context.id, filePath)
                request.context.code = 200
                request.context.data = fileData
            }
            next()
        }
    }
}
