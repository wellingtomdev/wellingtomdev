import { Server, Socket } from "socket.io"
import { deleteConnection, setConnection } from "./connections"
import createInternalExecution from "./createInternalExecution"
import internalMethods from "./internalMethods"
import onMessage from "./onMessage"
import eventName from "../eventNames"

setConnection(createInternalExecution('server', internalMethods))

function onConnection(socket: Socket) {
    const id = socket.id
    setConnection({ id, socket, config: {} })
    socket.on(eventName.disconnect, () => deleteConnection(id))
    socket.on(eventName.message, (...requests: any[]) => onMessage(socket, ...requests))
    socket.emit(eventName.setup, ['name', 'methods', 'states', 'listeners'])
    return socket
}


function getSocketServer(httpServer: any, options = {}) {
    const io = new Server(httpServer, { cors: { origin: '*', }, ...options })
    io.on(eventName.connection, onConnection)
    return io
}

async function createServer(port: number, options = {}) {
    const http = await import('http')
    return new Promise((resolve) => {
        const httpServer = http.createServer()
        httpServer.listen(port, () => {
            const socketServer = getSocketServer(httpServer, options)
            resolve(socketServer)
        })
    })
}

export default {
    getSocketServer,
    createServer,
}