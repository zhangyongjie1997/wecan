module.exports = function contextMiddleware(request, response, next) {
    request.context = {}
    next()
}