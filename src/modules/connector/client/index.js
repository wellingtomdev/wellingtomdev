const { io } = require('socket.io-client')
const random = require('../../random')
const delay = require('../../delay')

const defaultEventName = 'message'
const defaultEventResponse = 'response'
const defaultEventProcedure = 'procedure'

function createClient({
    url = "http://localhost:3000",
    name = "client",
    methods = {},
    onError = error => error,
    onDuplicated = error => error,
}) {

    const state = { url }

    const socket = io(url)
    socket.on('setup', async (requires) => {
        const payload = {}
        if (requires.includes('name')) payload.name = name
        if (requires.includes('methods')) payload.methods = Object.keys(methods)
        try {
            const response = await request('server', 'setup', payload)
            if (response.name) state.name = response.name
            if (response.methods) state.methods = response.methods
        } catch (error) {
            state.name = 'duplicated'
            if (error === 'Connection already exists') return onDuplicated(error)
            return onError(error)
        }
    })

    socket.on(defaultEventResponse, onResponse)
    socket.on(defaultEventProcedure, onProcedure)

    function getSocket() { return socket }

    function isConnected() {
        if (!state.name) return false
        return socket.connected
    }

    async function waitConnection() {
        if (isConnected()) return true
        await delay(100)
        return waitConnection()
    }

    function disconnect() { socket.disconnect() }

    const requests = {}

    function createId() {
        const id = random.string()
        if (requests[id]) return createId()
        return id
    }

    async function emit(...args) {
        return socket.emit(defaultEventName, ...args)
    }

    function request(targetName, call, ...args) {
        const id = createId()
        const promise = new Promise((resolve, reject) => requests[id] = { resolve, reject })
        emit({ id, targetName, call, args })
        return promise
    }

    async function onProcedure({ id, originId, call, args } = {}) {
        try {
            const method = methods[call]
            if (!method) throw new Error(`Method ${call} not found`)
            const response = await method(...args)
            emit({ id, originId, response, success: true, error: undefined })
        } catch (error) {
            emit({ id, originId, response: undefined, success: false, error })
        }
    }

    function onResponse({ id, response, success, error } = {}) {
        try {
            if (!requests[id]) return
            const { resolve, reject } = requests[id]
            success ? resolve(response) : reject(error)
            delete requests[id]
        } catch (error) {
            console.error(error)
        }
    }

    return {
        emit,
        state,
        request,
        getSocket,
        isConnected,
        waitConnection,
        disconnect,
    }

}

module.exports = {
    createClient,
}