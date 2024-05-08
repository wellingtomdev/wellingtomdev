async function delay(ms: number) {
    if (!ms) return
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default delay