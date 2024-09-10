import { Socket } from "socket.io"
import delay from "../../delay"
import eventNames from "../eventNames"
import getTagData from "../getTagData"
import { SetupValues } from "../types"
import { getConnectionById, getConnectionByName } from "./connections"
import { getServerOptions } from "./serverOptions"

const states: {
    [clientName: string]: {
        [stateName: string]: any
    }
} = {}

const listeners: {
    [clientName: string]: {
        [stateName: string]: string[]
    }
} = {}

function emitStateById(clientId: string, ...states: { tagData: string, value: any }[]) {
    const connection = getConnectionById(clientId)
    if (!connection) return false
    connection.socket.emit(eventNames.changeState, ...states)
    return true
}

function emitStateByName(clientName: string, ...states: { tagData: string, value: any }[]) {
    const connections = getConnectionByName(clientName)
    if (!connections.length) return false
    connections.map(({ id }) => emitStateById(id, ...states))
    return true
}


function getKeyAnValue(simpleObject: { [key: string]: any }) {
    const key = Object.keys(simpleObject)[0]
    const value = simpleObject[key]
    return { key, value }
}

function notifyChangeState(clientName: string, newStates: { [key: string]: any }) {
    const emitValues: { [clientId: string]: { tagData: string, value: any }[] } = {}
    const clientListeners = listeners[clientName]
    if (!clientListeners) return
    Object.keys(newStates).map((stateName) => {
        const value = newStates[stateName]
        if (!clientListeners[stateName]) return
        const tagData = getTagData(clientName, stateName)
        clientListeners[stateName] = clientListeners[stateName].filter(clientId => {
            if (!getConnectionById(clientId)) return false
            if (!emitValues[clientId]) emitValues[clientId] = []
            emitValues[clientId].push({ tagData, value })
            return true
        })
    })
    Object.keys(emitValues).map(clientId => {
        const states = (emitValues[clientId] || [])
        emitStateById(clientId, ...states)
    })
    return delay(100)
}

function getStatesByListener(...listenerNames: string[]) {
    return listenerNames.reduce((acc, tagData) => {
        const [clientName, key] = tagData.split(':')
        if (!states[clientName]) return acc
        const state = states[clientName]
        const value = state[key]
        acc.push({ tagData, value })
        return acc
    }, [] as { tagData: string, value: any }[])
}

function getPortInSocket(socket: Socket) {
    const host = socket.handshake.headers.host
    const port = host?.split(':')[1]
    return parseInt(port || '3100')
}

async function setup(originId: string, { name, methods = [], states = {}, listeners = [] }: SetupValues) {
    const connection = getConnectionById(originId)
    const serverOptions = getServerOptions(getPortInSocket(connection.socket))
    const exists = getConnectionByName(name)
    if (exists.length) {
        if (serverOptions.rules) {
            const rule = serverOptions.rules[name]
            if (rule && !rule.allowMultiple) {
                setTimeout(() => connection.socket.disconnect(), 100)
                throw 'Connection already exists'
            }
        } else {
            setTimeout(() => connection.socket.disconnect(), 100)
            throw 'Connection already exists'
        }
    }
    const config = { name, methods, states }
    connection.config = config
    setState(originId, states)
    const stateValues = getStatesByListener(...listeners)
    return {
        config,
        stateValues,
    }
}

async function setState(originId: string, value: { [key: string]: any }) {
    const clientName = getClientNameByClientId(originId)
    if (!clientName) throw 'Client not found'
    if (!states[clientName]) states[clientName] = {}
    states[clientName] = { ...states[clientName], ...value }
    notifyChangeState(clientName, value)
    await delay(100)
    return states[clientName]
}

function getClientNameByClientId(clientId: string) {
    const clientName = getConnectionById(clientId)?.config?.name
    if (!clientName) throw 'Client not found'
    return clientName
}

function getState(clientId?: string, stateName?: string) {
    if (!clientId) throw 'Client id is required'
    if (!stateName) throw 'stateName is required'
    const clientName = getClientNameByClientId(clientId)
    return getStateByClientName(clientName, stateName)
}

function getStateByClientName(clientName: string, stateName: string) {
    if (!clientName) throw 'Client not found'
    if (!states[clientName]) return undefined
    return states[clientName][stateName]
}

function listenState(originId: string, tagData: string) {
    const [targetName, propName] = tagData.split(':')
    if (!targetName) throw 'Target name is required'
    if (!listeners[targetName]) listeners[targetName] = {}
    const clientName = getClientNameByClientId(originId)
    if (!clientName) throw 'Client not found'
    if (!listeners[targetName][propName]) listeners[targetName][propName] = []
    listeners[targetName][propName].push(originId)
    const state = getStateByClientName(targetName, propName)
    emitStateById(originId, { tagData, value: state })
    if (!states[clientName]) return undefined
    return states[clientName][propName]
}

export function clearState(clientId: string) {
    try {
        const clientName = getClientNameByClientId(clientId)
        if (!clientName) throw 'Client not found'
        states[clientName] = {}
        const listennerEvents = listeners[clientName]
        if (!listennerEvents) return
        Object.keys(listennerEvents).map(stateName => {
            const listennerIds = listennerEvents[stateName]
            listennerIds.map(clientId => {
                emitStateById(clientId, { tagData: `${clientName}:${stateName}`, value: undefined })
            })
        })
    } catch (error) { }
}

export function _clearAllStates() {
    Object.keys(states).map(clientName => {
        Object.keys(states[clientName]).map(key => {
            const tagData = getTagData(clientName, key)
            emitStateByName(clientName, { tagData, value: undefined })
        })
    })
}

export default {
    setup,
    setState,
    getState,
    listenState,
}