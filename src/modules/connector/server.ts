import { Server, Socket } from "socket.io"
import http from "http"
import { ClientEmitProcedure, ClientEmitResponse, ServerEmitProcedure, ServerEmitResponse, ConnectionInServer } from "./types"

const connections: { [key: string]: ConnectionInServer } = {}

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

function internalExecution(nameAndId = 'internal', methods: any = {}) {
    async function emit(event: any, { id, originId, call, args }: { id: string, originId: string, call: string, args: any }) {
        try {
            const method = methods[call]
            const response = await method(originId, ...args)
            onMessage(fakeSocket, { id, originId, response, success: true, error: undefined })
        } catch (error) {
            onMessage(fakeSocket, { id, originId, response: undefined, success: false, error })
        }
    }
    const fakeSocket = { emit, id: nameAndId }
    return {
        id: nameAndId,
        socket: fakeSocket,
        config: { name: nameAndId, methods: Object.keys(methods) }
    }
}

connections['server'] = internalExecution('server', { setup })

function onMessage(socket: { id: string, emit: Function }, ...requests: any[]) {

    async function waitConnection({
        originId = '',
        targetName = ''
    }: {
        originId?: string,
        targetName?: string
    }, timeout = 5000): Promise<ConnectionInServer> {
        function getConnection() {
            return originId ? getConnectionById(originId) : getConnectionByName(targetName)
        }
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const connection = getConnection()
                if (!connection?.config) return
                clearInterval(interval)
                return resolve(connection)
            }, 100)
            setTimeout(() => {
                clearInterval(interval)
                reject('Connection not found')
            }, timeout)
        })
    }

    function emitError(messageError: string | { message: string } = 'Error', id?: string) {
        const error = { message: typeof messageError != 'string' ? messageError.message : messageError }
        if (!id) throw error
        return socket.emit('response', { id, response: undefined, success: false, error })
    }

    async function callProcedure({ id, targetName, call, args }: ClientEmitProcedure) {
        try {
            const connection = await waitConnection({ targetName })
            const methods = connection.config?.methods || []
            if (!methods.includes(call)) throw `Method not found ${call}`
            const originId = socket.id
            const values: ServerEmitProcedure = { id, originId, call, args }
            connection.socket.emit('procedure', values)
        } catch (error: any) {
            emitError(error, id)
        }
    }

    async function callResponse({ id, originId, response, success, error }: ClientEmitResponse) {
        try {
            const connection = getConnectionById(originId)
            if (!connection) await waitConnection({ originId })
            const values: ServerEmitResponse = { id, response, success, error }
            connection.socket.emit('response', values)
        } catch (error: any) {
            emitError(error, id)
        }
    }

    function processRequest(request: any) {
        if (socket.id != 'server') socket.emit('confirm', { id: request.id })
        const type = request?.targetName ? 'procedure' : 'response'
        if (type === 'procedure') return callProcedure(request)
        if (type === 'response') return callResponse(request)
        return emitError('Invalid request')
    }

    return requests.map((request: any) => processRequest(request))

}

function onConnection(socket: Socket) {
    const id = socket.id
    const connection = { id, socket, config: {}, }
    connections[id] = connection
    socket.on("disconnect", () => delete connections[id])
    socket.on("message", (...requests: any[]) => onMessage(socket, ...requests))
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
    return Object.values(connections).find(connection => connection?.config?.name === name)
}



export default {
    getSocketServer,
    createServer,
    getConnectionById,
}