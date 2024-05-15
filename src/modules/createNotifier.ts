import random from './random'

type ListenerIdType = string
type EventNameType = string
type SubscriberType = { listenerId: ListenerIdType, listener: Function, eventName: EventNameType }
type SubscribersType = { [key: ListenerIdType]: SubscriberType }
type EventSubscribersType = { [key: EventNameType]: { [key: ListenerIdType]: true } }


function createNotifier() {

    const subscribers: SubscribersType = {}
    const eventSubscribers: EventSubscribersType = {}

    function createSubscriberId(): ListenerIdType {
        const subscriberId = random.string()
        if (exists(subscriberId, null)) return createSubscriberId()
        return subscriberId
    }

    function subscribe(listener = () => { }, eventName = 'default'): ListenerIdType {
        if (typeof listener != 'function') throw new Error('Listener must be a function')
        const listenerId = createSubscriberId()
        if (eventSubscribers[eventName] == undefined) eventSubscribers[eventName] = {}
        subscribers[listenerId] = { listenerId, listener, eventName }
        eventSubscribers[eventName][listenerId] = true
        return listenerId
    }

    function count(eventName: null | string = 'default'): number {
        if (eventName === null) return Object.keys(subscribers).length
        return Object.keys(eventSubscribers[eventName] || {}).length
    }

    function exists(listenerId: ListenerIdType, eventName: null | string = 'default'): boolean {
        if (eventName === null) return !!subscribers[listenerId]
        return !!eventSubscribers[eventName] && eventSubscribers[eventName][listenerId] !== undefined
    }

    async function notify(listenerId: ListenerIdType, data: any, safed = false, eventName = 'default'): Promise<any> {
        if (!exists(listenerId, eventName)) throw new Error('Listener not found')
        try {
            const { listener } = subscribers[listenerId]
            const result = listener(data, listenerId)
            if (result instanceof Promise) return await result
            return result
        } catch (error) {
            if (safed) return undefined
            throw error
        }
    }

    function notifyAll(data: any, eventName: null | string = 'default'): boolean {
        function notifyAllInEvent(eventName: string) {
            const listenerIds = Object.keys(eventSubscribers[eventName] || {})
            listenerIds.forEach((listenerId: ListenerIdType) => notify(listenerId, data, true, eventName))
            return true
        }
        const eventNames = Object.keys(eventSubscribers)
        if (eventName) return notifyAllInEvent(eventName)
        eventNames.forEach(notifyAllInEvent)
        return true
    }

    function unsubscribe(listenerId: ListenerIdType, eventName = 'default'): boolean {
        if (!exists(listenerId, eventName)) throw new Error('Listener not found')
        delete subscribers[listenerId]
        delete eventSubscribers[eventName][listenerId]
        return true
    }

    function unsubscribeAll(eventName: null | string = 'default'): boolean {
        function unsubscribeAllInEvent(eventName: string) {
            const listenerIds = Object.keys(eventSubscribers[eventName])
            listenerIds.forEach((listenerId: ListenerIdType) => unsubscribe(listenerId, eventName))
            return true
        }
        const eventNames = Object.keys(eventSubscribers)
        if (eventName) return unsubscribeAllInEvent(eventName)
        eventNames.forEach(unsubscribeAllInEvent)
        return true
    }

    return {
        count,
        notify,
        exists,
        notifyAll,
        subscribe,
        unsubscribe,
        unsubscribeAll,
    }

}

export default createNotifier