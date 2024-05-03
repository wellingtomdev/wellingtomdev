function string(length = 10, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const result = []
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * chars.length)
        result.push(chars[index])
    }
    return result.join('')
}

module.exports = {
    string,
}