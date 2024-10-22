import { io } from 'socket.io-client'
import delay from '../../delay'
import eventName from '../eventNames'
import { EmitRequestValues, ServerEmitProcedure, ServerEmitResponse } from '../types'
import { confirmRequest, createRequestId, createRequestRegister, deleteRequest, getRequest } from './requestRegister'
import createNotifier from '../../createNotifier'
import getTagData from '../getTagData'

function encodeError(error: any){
    if(error instanceof Error) return {
        type: 'Error Class',
        name: error.name,
        message: error.message,
        stack: error.stack,
    }
    return error
}

function decodeError(error: any){
    if(error.type === 'Error Class') {
        const errorClass = new Error(error.message)
        errorClass.name = error.name
        errorClass.stack = error.stack
        return errorClass
    }
    return error
}

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

    const statesNofitier = createNotifier()

    const state: any = { url, states, isMultiple: false }
    const socket = io(url)
    const listeners: string[] = []

    let sinchronized = false
    const connectionNotifier = createNotifier()
    const sinchronizedEventName = 'sinchronized'
    const unsinchronizedEventName = 'unsinchronized'
    function isSinchronized() { return sinchronized === true }
    function setSinchronized(value: boolean) {
        sinchronized = value
        const eventName = value ? sinchronizedEventName : unsinchronizedEventName
        connectionNotifier.notifyAll(value, eventName)
    }

    function isWaintingSinchronization() {
        return !isSinchronized()
    }

    async function waitSinchronization(emitReject: boolean = false): Promise<boolean> {
        if (isSinchronized()) return true
        return new Promise((resolve, reject) => {
            const unsubscribe = () => {
                connectionNotifier.unsubscribe(sinchronizedListenerId, unsinchronizedListenerId)
                connectionNotifier.unsubscribe(unsinchronizedListenerId, sinchronizedListenerId)
            }
            const sinchronizedListenerId = connectionNotifier.subscribe(() => {
                resolve(true)
                unsubscribe()
            }, sinchronizedEventName)
            const unsinchronizedListenerId = connectionNotifier.subscribe(() => {
                emitReject ? reject(false) : resolve(false)
                unsubscribe()
            }, unsinchronizedEventName)
        })
    }

    function getSocket() { return socket }
    function isConnected() { return socket.connected }
    async function waitConnection(ms: number = 50) {
        while (!isConnected()) await delay(ms)
        return true
    }

    function disconnect() {
        socket.disconnect()
    }

    function onDisconnect() {
        setSinchronized(false)
        state.name = undefined
        state.methods = undefined
    }

    async function emit(request: EmitRequestValues, isSetup: boolean = false) {
        if (!isSetup && isWaintingSinchronization()) await waitSinchronization()
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
        if (requires.includes('states')) payload.states = state.states
        if (requires.includes('methods')) payload.methods = Object.keys(methods)
        if (requires.includes('listeners')) payload.listeners = listeners
        try {
            const { config, stateValues }: any = await request('server', 'setup', payload)
            onChangeState(...stateValues)
            if (config.name) state.name = config.name
            if (config.states) state.states = config.states
            if (config.methods) state.methods = config.methods
            if (config.isMultiple) state.isMultiple = config.isMultiple
            setSinchronized(true)
        } catch (error) {
            setSinchronized(false)
            state.name = 'duplicated'
            if (error === 'Connection already exists') return onDuplicated(error)
            return onError(error)
        }
    }

    function onConfirm({ id }: { id: string }) {
        confirmRequest(id)
    }

    async function onProcedure({ id, originId, call, args }: ServerEmitProcedure) {
        try {
            const method = methods[call]
            if (!method) throw new Error(`Method ${call} not found`)
            const response = await method(...args)
            if(state.isMultiple) return
            emit({ id, originId, response, success: true, error: undefined })
        } catch (error) {
            if(state.isMultiple) return
            emit({ id, originId, response: undefined, success: false, error: encodeError(error) })
        }
    }

    function onResponse({ id, response, success, error }: ServerEmitResponse) {
        try {
            if (!getRequest(id)) return
            const { resolve, reject } = getRequest(id)
            success ? resolve(response) : reject(decodeError(error))
            deleteRequest(id)
        } catch (error) {
            // console.error(error)
        }
    }

    async function onChangeState(...states: { tagData: string, value: any }[]) {
        states.map(({ tagData, value }) => {
            statesNofitier.notifyAll(value, tagData)
        })
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

    async function listenState(targetName: string, key: string, callback: (value: any, tagData: string) => any) {
        const tagData = getTagData(targetName, key)
        const isRegistered = statesNofitier.count(tagData)
        const listenerId = statesNofitier.subscribe(callback, tagData)
        if (!isRegistered) {
            await request('server', 'listenState', tagData)
            listeners.push(tagData)
        }
        return listenerId
    }


    socket.on(eventName.setup, onSetup)
    socket.on(eventName.confirm, onConfirm)
    socket.on(eventName.disconnect, onDisconnect)
    socket.on(eventName.procedure, onProcedure)
    socket.on(eventName.response, onResponse)
    socket.on(eventName.changeState, onChangeState)

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
        isSinchronized,
        waitSinchronization,
        isWaintingSinchronization,
        disconnect,
    }

}

export default {
    createClient,
}