import { io } from 'socket.io-client'
import delay from '../../delay'
import eventName from '../eventName'
import { EmitRequestValues, ServerEmitProcedure, ServerEmitResponse } from '../types'
import { confirmRequest, createRequestId, createRequestRegister, deleteRequest, getRequest } from './requestRegister'

function createClient({
    url = "http://localhost:3100",
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

    function getSocket() { return socket }

    function isConnected() {
        if (!state.name) return false
        return socket.connected
    }

    function isWatingConnection() {
        return !isConnected() && !state.methods
    }

    async function waitConnection(ms: number = 50) {
        while (!isConnected()) await delay(ms)
        return true
    }

    function disconnect() { socket.disconnect() }


    async function emit(request: EmitRequestValues, isSetup: boolean = false) {
        if (!isSetup && isWatingConnection()) await waitConnection(100)
        return socket.emit(eventName.message, request)
    }

    function request(targetName: string, call: string, ...args: any) {
        const id = createRequestId()
        const requestValue = { id, targetName, call, args }
        const promise = createRequestRegister(requestValue)
        const isSetup = targetName === 'server' && call === 'setup'
        emit(requestValue, isSetup)
        setTimeout(() => {
            const request = getRequest(id)
            if (!request || request.received) return
            emit(requestValue, isSetup)
        }, 100)
        return promise
    }

    async function onSetup(requires: any) {
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
    }

    function onConfirm({ id }: { id: string }) {
        confirmRequest(id)
    }

    function onDisconnect() {
        state.name = undefined
        state.methods = undefined
    }

    async function onProcedure({ id, originId, call, args }: ServerEmitProcedure) {
        try {
            const method = methods[call]
            if (!method) throw new Error(`Method ${call} not found`)
            const response = await method(...args)
            emit({ id, originId, response, success: true, error: undefined })
        } catch (error) {
            emit({ id, originId, response: undefined, success: false, error })
        }
    }

    function onResponse({ id, response, success, error }: ServerEmitResponse) {
        try {
            if (!getRequest(id)) return
            const { resolve, reject } = getRequest(id)
            success ? resolve(response) : reject(error)
            deleteRequest(id)
        } catch (error) {
            // console.error(error)
        }
    }


    socket.on(eventName.setup, onSetup)
    socket.on(eventName.confirm, onConfirm)
    socket.on(eventName.disconnect, onDisconnect)
    socket.on(eventName.procedure, onProcedure)
    socket.on(eventName.response, onResponse)

    return {
        emit,
        state,
        request,
        getSocket,
        getRequest,
        isConnected,
        waitConnection,
        disconnect,
    }

}

export default {
    createClient,
}