import { Server } from "socket.io"
import http from "http"

const connections = {}

function setup(originId, { name, methods } = {}) {
    const exists = getConnectionByName(name)
    const connection = getConnectionById(originId)
    if (exists) {
        setTimeout(() => connection.socket.disconnect(), 100)
        throw 'Connection already exists'
    }
    connection.config = { name, methods }
    return connection.config
}

function internalExecution(name = 'internal', methods = {}) {
    async function emit(event, { id, originId, call, args }) {
        try {
            const method = methods[call]
            const response = await method(originId, ...args)
            onMessage(null, { id, originId, response, success: true, error: undefined })
        } catch (error) {
            onMessage(null, { id, originId, response: undefined, success: false, error })
        }
    }
    return {
        socket: { emit },
        config: { name, methods: Object.keys(methods) }
    }
}

connections['server'] = internalExecution('server', { setup })

function onMessage(socket, request = {}) {

    function emitError(messageError = 'Error', id = undefined) {
        const error = { message: messageError }
        if(!id) throw error
        return socket.emit('response', { id, response: undefined, success: false, error })
    }

    function callProcedure({ id, targetName, call, args } = {}) {
        const connection = getConnectionByName(targetName)
        if (!connection) return emitError('Connection not found', id)
        const methods = connection.config?.methods || []
        if (!methods.includes(call)) return emitError('Method not found ' + call, id)
        const originId = socket.id
        connection.socket.emit('procedure', { id, originId, call, args })
    }

    function callResponse({ id, originId, response, success, error } = {}) {
        const connection = getConnectionById(originId)
        if (!connection) return emitError('Connection not found')
        connection.socket.emit('response', { id, response, success, error })
    }

    const type = request?.targetName ? 'procedure' : 'response'
    if (type === 'procedure') return callProcedure(request)
    if (type === 'response') return callResponse(request)
    return emitError('Invalid request')

}

function onConnection(socket) {
    const id = socket.id
    const connection = { id, socket, config: {}, }
    connections[id] = connection
    socket.on("disconnect", () => delete connections[id])
    socket.on("message", (...args) => onMessage(socket, ...args))
    socket.emit("setup", ['name', 'methods'])
    return socket
}


function getSocketServer(httpServer, options = {}) {
    const io = new Server(httpServer, options)
    io.on("connection", onConnection)
    return io
}

async function createServer(port, options = {}) {
    return new Promise((resolve) => {
        const httpServer = http.createServer()
        httpServer.listen(port, () => {
            const io = getSocketServer(httpServer, options)
            resolve(io)
        })
    })
}

function getConnectionById(id) {
    return connections[id]
}

function getConnectionByName(name) {
    return Object.values(connections).find(connection => connection.config.name === name)
}



export default {
    getSocketServer,
    createServer,
    getConnectionById,
}