const http = require('http')
const corsMiddleware = require('cors')
const Connect = require('connect')
const cacheMiddleware = require('./middlewares/cacheMiddleware')
const contextMiddleware = require('./middlewares/contextMiddleware')
const resolveIdMiddleware = require('./middlewares/resolveIdMiddleware')
const buildSourceMiddleware = require('./middlewares/buildSourceMiddleware')
const epc = require('../../utils/efesProjectConfigs')

const app = Connect()

const ContentTypes = {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json',
}

class ProxyServer {
    workSpaceConfig = null // workSpace 配置
    workSpaceDirname = null // workSpace 目录
    options = null

    constructor(workSpaceConfig, workSpaceDirname, options) {
        this.workSpaceConfig = workSpaceConfig
        this.workSpaceDirname = workSpaceDirname
        this.options = options
        this.allConfigs = epc.find(workSpaceConfig, workSpaceDirname)
        this.__initServer()
    }

    __initServer() {
        const httpServer = http.createServer(app)
        app.use(contextMiddleware)
        app.use(resolveIdMiddleware)
        app.use(corsMiddleware())
        app.use(cacheMiddleware(this.workSpaceConfig, this.workSpaceDirname, this.options))
        app.use(buildSourceMiddleware)
        httpServer.listen(this.options.port, (err) => {
            if (err) {
                global.efesecho.error(chalk.red('efes本地代理服务启动失败'))
            } else {
                global.efesecho.log('启动成功，监听端口： %s', this.options.port)
            }
        })
    }
}

module.exports = ProxyServer
