import { io } from 'socket.io-client'
import delay from '../../delay'
import eventName from '../eventNames'
import { EmitRequestValues, ServerEmitProcedure, ServerEmitResponse } from '../types'
import { confirmRequest, createRequestId, createRequestRegister, deleteRequest, getRequest } from './requestRegister'
import createNotifier from '../../createNotifier'
import getTagData from '../getTagData'

function createClient({
    url = "http://localhost:3100",
    name = "client",
    methods = {},
    states = {},
    onError = (error: any) => error,
    onDuplicated = (error: any) => error,
}: {
    url?: string,
    name?: string,
    methods?: { [key: string]: (...args: any) => any },
    states?: { [key: string]: any },
    onError?: (error: any) => any,
    onDuplicated?: (error: any) => any,
} = {
    }) {

    const nofitier = createNotifier()
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

    function disconnect() {
        socket.disconnect()
    }

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
        if (requires.includes('states')) payload.states = states
        if (requires.includes('methods')) payload.methods = Object.keys(methods)
        try {
            const response: any = await request('server', 'setup', payload)
            if (response.name) state.name = response.name
            if (response.states) state.states = response.states
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

    async function onChageState({ tagData, value }: { tagData: string, value: any }) {
        nofitier.notifyAll(value, tagData)
    }

    async function setState(value: { [key: string]: any }): Promise<any> {
        if (!state.states) state.states = {}
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw 'Value must be an object'
        if (!Object.keys(value).length) throw 'Value must have at least one key'
        const result = await request('server', 'setState', value)
        state.states = result
        return result
    }

    function getState(key: string | undefined = undefined) {
        const states = state?.states || {}
        if (!key) return state?.states || {}
        return states[key]
    }

    async function listenState(targetName: string, key: string, callback = () => { }) {
        const tagData = getTagData(targetName, key)
        const isRegistered = nofitier.count(tagData)
        const listenerId = nofitier.subscribe(callback, tagData)
        if (!isRegistered) await request('server', 'listenState', targetName, key)
        return listenerId
    }


    socket.on(eventName.setup, onSetup)
    socket.on(eventName.confirm, onConfirm)
    socket.on(eventName.disconnect, onDisconnect)
    socket.on(eventName.procedure, onProcedure)
    socket.on(eventName.response, onResponse)
    socket.on(eventName.changeState, onChageState)

    return {
        emit,
        state,
        setState,
        getState,
        listenState,
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