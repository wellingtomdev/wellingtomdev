async function delay(ms) {
    if (!ms) return
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = delay