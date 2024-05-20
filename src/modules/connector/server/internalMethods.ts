import delay from "../../delay"
import eventNames from "../eventNames"
import getTagData from "../getTagData"
import { getConnectionById, getConnectionByName } from "./connections"

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

function emitState(listener: string, ...states: { tagData: string, value: any }[]) {
    const connection = getConnectionByName(listener)
    if (!connection) return false
    connection.socket.emit(eventNames.changeState, ...states)
    return true
}

function getKeyAnValue(simpleObject: { [key: string]: any }) {
    const key = Object.keys(simpleObject)[0]
    const value = simpleObject[key]
    return { key, value }
}

function notifyChangeState(clientName: string, newStates: { [key: string]: any }) {
    const emitValues: { [listener: string]: { tagData: string, value: any }[] } = {}
    const clientListeners = listeners[clientName]
    if (!clientListeners) return
    Object.keys(newStates).map((key) => {
        const value = newStates[key]
        if (!clientListeners[key]) return
        const tagData = getTagData(clientName, key)
        clientListeners[key] = clientListeners[key].filter(listener => {
            if (!getConnectionByName(listener)) return false
            if (!emitValues[listener]) emitValues[listener] = []
            emitValues[listener].push({ tagData, value })
            return true
        })
    })
    Object.keys(emitValues).map(listener => {
        const states = (emitValues[listener] || [])
        emitState(listener, ...states)
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

type SetupValues = { name: string, methods: string[], states: { [key: string]: any }, listeners: string[] }
async function setup(originId: string, { name, methods = [], states = {}, listeners = [] }: SetupValues) {
    const exists = getConnectionByName(name)
    const connection = getConnectionById(originId)
    if (exists) {
        setTimeout(() => connection.socket.disconnect(), 100)
        throw 'Connection already exists'
    }
    const config = { name, methods, states }
    connection.config = config
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

function getState(originId: string, clientId: string, key: string) {
    const clientName = getClientNameByClientId(clientId)
    return getStateByClientName(clientName, key)
}

function getStateByClientName(clientName: string, key: string) {
    if (!clientName) throw 'Client not found'
    if (!states[clientName]) return undefined
    return states[clientName][key]
}

function listenState(originId: string, tagData: string) {
    const [targetName, key] = tagData.split(':')
    if (!targetName) throw 'Target name is required'
    if (!listeners[targetName]) listeners[targetName] = {}
    const clientName = getClientNameByClientId(originId)
    if (!clientName) throw 'Client not found'
    if (!listeners[targetName][key]) listeners[targetName][key] = []
    listeners[targetName][key].push(clientName)
    const value = getStateByClientName(targetName, key)
    emitState(clientName, { tagData, value })
    if (!states[clientName]) return undefined
    return states[clientName][key]
}

export function _clearAllStates() {
    Object.keys(states).map(clientName => {
        Object.keys(states[clientName]).map(key => {
            const tagData = getTagData(clientName, key)
            emitState(clientName, { tagData, value: undefined })
        })
    })
}

export default {
    setup,
    setState,
    getState,
    listenState,
}