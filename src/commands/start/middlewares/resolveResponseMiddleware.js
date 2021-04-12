const zlib = require('zlib')
const stream = require('stream')
const mime = require('mime')

const rType = /\.(\w+)$/i;


module.exports = function resolveResponseMiddleware(request, response, next) {
    const data = request.context.data,
        code = request.context.code,
        pathname = request.context.pathname
    const ContentType = pathname.match(rType) ? mime.getType(pathname) : mime.getType('json')
    if (data) {
        let acceptEncoding = request.headers['accept-encoding']
        if (acceptEncoding && acceptEncoding.indexOf('gzip') != -1) {
            response.writeHeader(code, {
                'Content-Type': ContentType,
                'Content-Encoding': 'gzip',
                Vary: 'Accept-Encoding',
            })

            var raw = new stream.PassThrough()
            raw.end(data)
            raw.pipe(zlib.createGzip()).pipe(response)
        } else {
            response.writeHeader(code, {
                'Content-Type': ContentType,
                'Content-Length': Buffer.byteLength(data, 'utf-8'),
            })
            response.write(data)
            response.end()
        }
        // response.write(data)
        // response.end()
    } else {
        response.writeHeader(code || 404)
        response.end()
    }
}
