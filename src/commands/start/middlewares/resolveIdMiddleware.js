const path = require('path')
const url = require('url')
const chalk = require('chalk')

module.exports = function (request, response, next) {
    let pathname = url.parse(request.url).pathname

    if (pathname.match(/\/$/)) {
        pathname = pathname + 'index.html'
    }

    let host = request.headers.host
    global.efesecho.log(chalk.bold.green('GET:') + ' http://' + host + pathname);
    request.context.id = path.join(host, pathname)
    request.context.pathname = pathname
    request.context.host = host

    next()
}
