const chalk = require('chalk')
const readFile = require('../../../utils/readFile')
module.exports = async function (request, response, next) {
    if (request.context.useCache) {
        const source = request.context.sourceUrl
        if (typeof source === 'string') {
            const [error, fileData] = await readFile(source)
        } else {
            const [error, fileData] = await readFile(source)
            if (error) {
                global.efesecho.error(chalk.bold.white.bgRed(' ERROR '))

                error.some(function (_err) {
                    global.efesecho.error(_err)
                })

                if (fileData) {
                    request.context.code = 502
                } else {
                    request.context.code = 404
                }
            } else {
                request.context.code = 200
                request.context.data = fileData
            }
        }
    }
    next()
}


const parseSource = (source) => {
    
}