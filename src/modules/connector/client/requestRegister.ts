import random from '../../random'
import { EmitRequestValues, Request } from '../types'

export const requests: { [key: string]: Request } = {}

export function createRequestId() {
    const id = random.string()
    if (getRequest(id)) return createRequestId()
    return id
}

export function createRequestRegister(requestValue: EmitRequestValues) {
    let resolve: Function = () => { }
    let reject: Function = () => { }
    const promise = new Promise((_resolve: Function, _reject: Function) => { resolve = _resolve; reject = _reject })
    setRequest(requestValue.id, { resolve, reject, requestValue, received: false })
    return promise
}

export function confirmRequest(id: string) {
    const request = getRequest(id)
    if (!request) return
    request.received = true
}

export function getRequest(id: string) { 
    return requests[id]
 }

export function setRequest(id: string, request: Request) { 
    requests[id] = request
 }

export function deleteRequest(id: string) { 
    delete requests[id] 
}


export default {
    createRequestId,
    createRequestRegister,
    confirmRequest,
    getRequest,
    setRequest,
    deleteRequest,
}