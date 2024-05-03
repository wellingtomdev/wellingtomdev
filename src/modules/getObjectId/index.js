function getObjectId(object = {}) {
    const keys = Object.keys(object).sort()
    const values = keys.map(prop => {
        const value = object[prop]
        if(typeof value === 'object') return getObjectId(value)
        return value
    })
    return values.join('-')
}

module.exports = getObjectId