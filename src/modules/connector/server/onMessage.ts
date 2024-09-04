import { Socket } from "socket.io"
import eventNames from "../eventNames"
import { ClientEmitProcedure, ClientEmitResponse, ConnectionInServer, ServerEmitProcedure, ServerEmitResponse } from "../types"
import { getConnectionById, getConnectionByName } from "./connections"


function onMessage(socket: { id: string, emit: Function }, ...requests: any[]) {

    async function waitConnection({
        originId = '',
        targetName = ''
    }: {
        originId?: string,
        targetName?: string
    }, timeout = 5000): Promise<ConnectionInServer<Socket>[]> {
        function getConnection() {
            return originId ? [getConnectionById(originId)] : getConnectionByName(targetName)
        }
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const connections = getConnection()
                if (!connections.length) return
                if (!connections.every(connection => connection?.config)) return
                clearInterval(interval)
                return resolve(connections)
            }, 100)
            setTimeout(() => {
                clearInterval(interval)
                reject('Connection not found')
            }, timeout)
        })
    }

    function emitError(messageError: string | { message: string } = 'Error', id?: string) {
        // console.log('emitError', { messageError, id })
        const error = { message: typeof messageError != 'string' ? messageError.message : messageError }
        if (!id) throw error
        return socket.emit(eventNames.response, { id, response: undefined, success: false, error })
    }

    async function callProcedure({ id, targetName, call, args }: ClientEmitProcedure) {
        try {
            const connection = (await waitConnection({ targetName }))[0]
            const methods = connection?.config?.methods || []
            if (!methods.includes(call)) throw `Method not found ${call}`
            const originId = socket.id
            const values: ServerEmitProcedure = { id, originId, call, args }
            connection.socket.emit(eventNames.procedure, values)
        } catch (error: any) {
            emitError(error, id)
        }
    }

    async function callResponse({ id, originId, response, success, error }: ClientEmitResponse) {
        // console.log('callResponse', { id, originId, response, success, error })
        try {
            const connection = getConnectionById(originId)
            if (!connection) await waitConnection({ originId })
            const values: ServerEmitResponse = { id, response, success, error }
            connection.socket.emit(eventNames.response, values)
        } catch (error: any) {
            emitError(error, id)
        }
    }

    function processRequest(request: any) {
        // console.log('processRequest', request)
        if (socket.id != 'server') socket.emit(eventNames.confirm, { id: request.id })
        const type = request?.targetName ? eventNames.procedure : eventNames.response
        if (type === eventNames.procedure) return callProcedure(request)
        if (type === eventNames.response) return callResponse(request)
        return emitError('Invalid request')
    }

    // console.log('onMessage', requests)
    return requests.map((request: any) => processRequest(request))

}

export default onMessage

