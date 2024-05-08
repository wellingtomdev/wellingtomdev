import { Server } from "socket.io"
import http from "http"

const connections: { [key: string]: any } = {}

function setup(originId: string, { name, methods }: { name: string, methods: any }) {
    const exists = getConnectionByName(name)
    const connection = getConnectionById(originId)
    if (exists) {
        setTimeout(() => connection.socket.disconnect(), 100)
        throw 'Connection already exists'
    }
    connection.config = { name, methods }
    return connection.config
}

function internalExecution(name = 'internal', methods: any = {}) {
    async function emit(event: any, { id, originId, call, args }: { id: string, originId: string, call: string, args: any }) {
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

function onMessage(socket: any, request: any = {}) {

    function emitError(messageError = 'Error', id?: string) {
        const error = { message: messageError }
        if (!id) throw error
        return socket.emit('response', { id, response: undefined, success: false, error })
    }

    function callProcedure({ id, targetName, call, args }: { id: string, targetName: string, call: string, args: any }) {
        const connection = getConnectionByName(targetName)
        if (!connection) return emitError('Connection not found', id)
        const methods = connection.config?.methods || []
        if (!methods.includes(call)) return emitError('Method not found ' + call, id)
        const originId = socket.id
        connection.socket.emit('procedure', { id, originId, call, args })
    }

    function callResponse({ id, originId, response, success, error }: { id: string, originId: string, response: any, success: boolean, error: any }) {
        const connection = getConnectionById(originId)
        if (!connection) return emitError('Connection not found')
        connection.socket.emit('response', { id, response, success, error })
    }

    const type = request?.targetName ? 'procedure' : 'response'
    if (type === 'procedure') return callProcedure(request)
    if (type === 'response') return callResponse(request)
    return emitError('Invalid request')

}

function onConnection(socket: any) {
    const id = socket.id
    const connection = { id, socket, config: {}, }
    connections[id] = connection
    socket.on("disconnect", () => delete connections[id])
    socket.on("message", (...args: any) => onMessage(socket, ...args))
    socket.emit("setup", ['name', 'methods'])
    return socket
}


function getSocketServer(httpServer: any, options = {}) {
    const io = new Server(httpServer, options)
    io.on("connection", onConnection)
    return io
}

async function createServer(port: number, options = {}) {
    return new Promise((resolve) => {
        const httpServer = http.createServer()
        httpServer.listen(port, () => {
            const io = getSocketServer(httpServer, options)
            resolve(io)
        })
    })
}

function getConnectionById(id: string) {
    return connections[id]
}

function getConnectionByName(name: string) {
    return Object.values(connections).find(connection => connection.config.name === name)
}



export default {
    getSocketServer,
    createServer,
    getConnectionById,
}