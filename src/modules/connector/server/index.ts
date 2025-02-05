import { Server, Socket } from "socket.io"
import { deleteConnection, setConnection } from "./connections"
import createInternalExecution from "./createInternalExecution"
import internalMethods from "./internalMethods"
import onMessage from "./onMessage"
import eventName from "../eventNames"
import { ServerOptionsT } from "../types"
import { setServerOptions } from "./serverOptions"

setConnection(createInternalExecution('server', internalMethods))

function onConnection(socket: Socket) {
    const id = socket.id
    setConnection({ id, socket, config: {} })
    socket.on(eventName.disconnect, () => deleteConnection(id))
    socket.on(eventName.message, (...requests: any[]) => onMessage(socket, ...requests))
    socket.emit(eventName.setup, ['name', 'methods', 'states', 'listeners'])
    return socket
}

function getSocketServer(httpServer: any) {
    const io = new Server(httpServer, { cors: { origin: '*' }, maxHttpBufferSize: 1024 * 1024 * 1024 * 20 })
    io.on(eventName.connection, onConnection)
    return io
}

async function createServer(port: number, options: ServerOptionsT = {}): Promise<Server> {
    const http = await import('http')
    return new Promise((resolve) => {
        const httpServer = http.createServer()
        httpServer.listen(port, () => {
            const socketServer = getSocketServer(httpServer)
            setServerOptions(port, options)
            resolve(socketServer)
        })
    })
}

export default {
    getSocketServer,
    createServer,
}