import { io } from 'socket.io-client'
import random from '../random'
import delay from '../delay'

const defaultEventName = 'message'
const defaultEventResponse = 'response'
const defaultEventProcedure = 'procedure'

function createClient({
    url = "http://localhost:3000",
    name = "client",
    methods = {},
    onError = (error: any) => error,
    onDuplicated = (error: any) => error,
}: {
    url?: string,
    name?: string,
    methods?: { [key: string]: (...args: any) => any },
    onError?: (error: any) => any,
    onDuplicated?: (error: any) => any,
} = {
    }) {

    const state: any = { url }

    const socket = io(url)
    socket.on('setup', async (requires: any) => {
        const payload: any = {}
        if (requires.includes('name')) payload.name = name
        if (requires.includes('methods')) payload.methods = Object.keys(methods)
        try {
            const response: any = await request('server', 'setup', payload)
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

    const requests: any = {}

    function createId() {
        const id = random.string()
        if (requests[id]) return createId()
        return id
    }

    async function emit(...args: any) {
        return socket.emit(defaultEventName, ...args)
    }

    function request(targetName: string, call: string, ...args: any) {
        const id = createId()
        const promise = new Promise((resolve, reject) => requests[id] = { resolve, reject })
        emit({ id, targetName, call, args })
        return promise
    }

    async function onProcedure({ id, originId, call, args }: { id: string, originId: string, call: string, args: any }) {
        try {
            const method = methods[call]
            if (!method) throw new Error(`Method ${call} not found`)
            const response = await method(...args)
            emit({ id, originId, response, success: true, error: undefined })
        } catch (error) {
            emit({ id, originId, response: undefined, success: false, error })
        }
    }

    function onResponse({ id, response, success, error }: any = {}) {
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

export default {
    createClient,
}