const axios = require('axios')

async function checkPortAvailability(port) {
    return await axios.get(`http://localhost:${port}`)
        .then(() => false)
        .catch((err) => {
            if (err.code === 'ECONNREFUSED') return true
            return false
        })
}

async function getAvailablePort(initPort = 3000, limit = 100) {
    let testPort = initPort
    while (testPort < initPort + limit) {
        const available = await checkPortAvailability(testPort)
        if (available) return testPort
        testPort++
    }
}

module.exports = getAvailablePort