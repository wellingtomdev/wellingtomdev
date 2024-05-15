import onMessage from "./onMessage"

function createInternalExecution(nameAndId = 'internal', methods: any = {}) {
    async function emit(event: any, { id, originId, call, args }: { id: string, originId: string, call: string, args: any }) {
        try {
            const method = methods[call]
            const response = await method(originId, ...args)
            onMessage(fakeSocket, { id, originId, response, success: true, error: undefined })
        } catch (error) {
            onMessage(fakeSocket, { id, originId, response: undefined, success: false, error })
        }
    }
    const fakeSocket = { emit, id: nameAndId }
    return {
        id: nameAndId,
        socket: fakeSocket,
        config: { name: nameAndId, methods: Object.keys(methods) }
    }
}

export default createInternalExecution