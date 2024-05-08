import random from './random'

function createNotifier() {

    const subscribers = {}

    function exists(listenerId) {
        return subscribers[listenerId] !== undefined
    }

    function subscribe(listener = () => { }) {
        if (typeof listener != 'function') throw new Error('Listener must be a function')
        const listenerId = random.string()
        if (exists(listenerId)) return subscribe(listener)
        subscribers[listenerId] = { listenerId, listener }
        return listenerId
    }

    async function notify(listenerId, data, safed = false) {
        if (!exists(listenerId)) throw new Error('Listener not found')
        try {
            const { listener } = subscribers[listenerId]
            const result = listener(data, listenerId)
            if(result instanceof Promise) return await result
            return result
        } catch (error) {
            if (safed) return undefined
            throw error
        }
    }

    function notifyAll(data) {
        const subscribersIds = Object.keys(subscribers)
        subscribersIds.forEach(listenerId => notify(listenerId, data, true))
        return true
    }

    function unsubscribe(listenerId) {
        if (!exists(listenerId)) throw new Error('Listener not found')
        delete subscribers[listenerId]
        return true
    }

    function unsubscribeAll() {
        const subscribersIds = Object.keys(subscribers)
        subscribersIds.forEach(listenerId => unsubscribe(listenerId))
        return true
    }

    function count() {
        return Object.keys(subscribers).length
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