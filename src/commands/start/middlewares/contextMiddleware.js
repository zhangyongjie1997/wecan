module.exports = function (request, response, next) {
    request.context = {}
    next()
}