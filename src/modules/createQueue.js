import random from './random'

function createQueue({
    initStarted = true,
} = {}) {
    const state = {
        running: false,
        started: !!initStarted,
    }
    const tasks = {}
    const order = []

    function getStarted() {
        return state.started
    }

    function start() {
        state.started = true
        run()
    }

    function stop() {
        state.started = false
    }

    function add(callback = () => { }) {
        const taskId = random.string()
        if (tasks[taskId]) return add(callback)
        order.push(taskId)
        const task = {
            id: taskId,
            callback,
            resolve: () => { },
            reject: () => { },
        }
        const promise = new Promise((resolve, reject) => {
            task.resolve = resolve
            task.reject = reject
        })
        task.promise = promise
        tasks[taskId] = task
        run()
        return {
            id: taskId,
            promise,
        }
    }

    function get(taskId) {
        return tasks[taskId]
    }  

    function remove(taskId) {
        if (!tasks[taskId]) return false
        const index = order.indexOf(taskId)
        if (index >= 0) order.splice(index, 1)
        delete tasks[taskId]
        return true
    }

    async function run() {
        if (!state.started) return
        if (state.running) return
        state.running = true
        while (order.length) {
            if (!state.started) break
            const taskId = order.shift()
            const task = tasks[taskId]
            try {
                const result = await task.callback()
                task.resolve(result)
            } catch (error) {
                task.reject(error)
            }
            delete tasks[taskId]
        }
        state.running = false
    }

    if (initStarted) run()

    return {
        getStarted,
        start,
        stop,
        add,
        get,
        remove,
        run,
    }

}

export default createQueue