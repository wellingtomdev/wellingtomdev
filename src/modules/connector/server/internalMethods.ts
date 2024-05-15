import eventNames from "../eventNames"
import getTagData from "../getTagData"
import { getConnectionById, getConnectionByName } from "./connections"

const states: { [clientName: string]: { [key: string]: any } } = {}
const listeners: { [clientName: string]: { [key: string]: string[] } } = {}

function notifyChangeState(clientName: string, _value: { [key: string]: any }) {
    const key = Object.keys(_value)[0]
    const value = _value[key]
    if (!listeners[clientName] || !listeners[clientName][key]) return
    const tagData = getTagData(clientName, key)
    listeners[clientName][key] = listeners[clientName][key].filter((listener) => {
        const connection = getConnectionByName(listener)
        if (!connection) return false
        connection.socket.emit(eventNames.changeState, { tagData, value })
        return true
    })
}

function setup(originId: string, { name, methods = [], states = {} }: { name: string, methods: any, states: any }) {
    const exists = getConnectionByName(name)
    const connection = getConnectionById(originId)
    if (exists) {
        setTimeout(() => connection.socket.disconnect(), 100)
        throw 'Connection already exists'
    }
    connection.config = { name, methods, states }
    return connection.config
}

function setState(originId: string, value: { [key: string]: any }) {
    const clientName = getConnectionById(originId)?.config?.name
    if (!clientName) throw 'Client not found'
    if (!states[clientName]) states[clientName] = {}
    states[clientName] = { ...states[clientName], ...value }
    notifyChangeState(clientName, value)
    return states[clientName]
}

function getState(originId: string, clientId: string, key: string) {
    const clientName = getConnectionById(clientId)?.config?.name
    if (!clientName) throw 'Client not found'
    if (!states[clientName]) return undefined
    return states[clientName][key]
}

function listenState(originId: string, targetName: string, key: string) {
    if (!targetName) throw 'Target name is required'
    if (!listeners[targetName]) listeners[targetName] = {}
    const clientName = getConnectionById(originId)?.config?.name
    if (!clientName) throw 'Client not found'
    if (!listeners[targetName][key]) listeners[targetName][key] = []
    listeners[targetName][key].push(clientName)
    if(!states[clientName]) return undefined
    return states[clientName][key]
}


export default {
    setup,
    setState,
    getState,
    listenState,
}