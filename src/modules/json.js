function parse(json, throwNull = false) {
    try {
        return JSON.parse(json)
    } catch (error) {
        return throwNull ? null : json
    }
}

function stringify(data) {
    try {
        if (typeof data === 'string') data = JSON.parse(data)
        return JSON.stringify(data)
    } catch (error) {
        return typeof data === 'string' ? data : undefined
    }
}

module.exports = {
    parse,
    stringify,
}