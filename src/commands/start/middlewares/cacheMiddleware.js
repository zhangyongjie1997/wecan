const { ModuleGraph } = require('../moduleGraph')
const moduleGraph = new ModuleGraph()
module.exports = function (request, response, next) {
    const cache = moduleGraph.searchModuleById(request.context.id)
    if(cache !== null && cache !== undefined) {
        request.context.sourceUrl = cache.sourceUrl
    }
    next()
}
