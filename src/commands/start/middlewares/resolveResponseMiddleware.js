module.exports = function (request, response, next) {
    const data = request.context.data,
        code = request.context.code
    if (data) {
        response.write(data)
        response.end()
    } else {
        response.writeHeader(code || 404)
        response.end()
    }
}
