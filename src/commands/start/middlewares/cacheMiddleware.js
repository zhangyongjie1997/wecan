const { ModuleGraph } = require('../moduleGraph')
const epc = require('../../../utils/efesProjectConfigs')
const reqMatchToLocalPath = require('../../../utils/reqMatchToLocalPath')
const moduleGraph = new ModuleGraph()
module.exports = function (workSpaceConfig, workSpaceDirname) {
    return function cacheMiddleware(request, response, next) {
        const { pathname, host, id } = request.context
        const cache = moduleGraph.searchModuleById(id)
        if(cache !== null && cache !== undefined) {
            context.sourceUrl = cache.sourceUrl
        } else {
            
            let projectConfigs = epc.getProjectConfig(host, pathname, workSpaceConfig, workSpaceDirname, workSpaceConfig.projects);
            let pathConfigs = reqMatchToLocalPath.match(host, pathname, projectConfigs, workSpaceDirname);
            console.log(pathConfigs)
        }
        next()
    }
}
