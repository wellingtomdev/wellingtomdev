import { describe, expect, test, vi } from 'vitest'
import socketServer from '../modules/connector/server'
import socketClient from '../modules/connector/client'
import delay from '../modules/delay'
import internalMethods, { _clearAllStates } from '../modules/connector/server/internalMethods'
import random from '../modules/random'

describe('socketServer', () => {

    describe('createServer', () => {

        test('Métodos', () => {
            expect(socketServer.getSocketServer).toBeDefined()
            expect(socketServer.createServer).toBeDefined()
        })

        test('createServer', async () => {
            const server = await socketServer.createServer(3100)
            try {
                expect(server).toBeDefined()
                expect(server).toHaveProperty('on')
                expect(server).toHaveProperty('emit')
            } catch (error) {
                throw error
            } finally {
                server.close()
            }
        })

    })

    async function createServerForTests(...events: any[]) {
        let port = 3100
        if (typeof events[0] == 'number') port = events.shift()
        const server = await socketServer.createServer(port)
        expect(server.engine.clientsCount).toBe(0)
        const messages: { event: string, args: any[] }[] = []
        events.forEach(event => server.on(event, (...args: any[]) => messages.push({ event, args })))
        return { server, messages, port }
    }

    describe('createClient', () => {

        test('Conecta a um socket', async () => {
            const { server, messages, port } = await createServerForTests(3101, 'connection')
            try {
                const client = socketClient.createClient({ url: `http://localhost:${port}` })
                await client.waitSinchronization()
                expect(messages.length).toBe(1)
                const [message] = messages
                expect(message.event).toBe('connection')
                expect(message.args.length).toBe(1)
                const [socket] = message.args
                expect(socket).toBeDefined()
                expect(socket.id).toBeDefined()
                socket.disconnect()
            } catch (error) {
                throw error
            } finally {
                server.close()
            }

        })

    })

    describe('ping', () => {

        test('Testa o tempo de resposta', async () => {
            const { server, port } = await createServerForTests(3101, 'connection')
            try {
                const client = socketClient.createClient({ url: `http://localhost:${port}` })
                await client.waitSinchronization()
                const ping = await client.ping()
                expect(ping.time).toBeLessThan(3)
                client.disconnect()
            } catch (error) {
                throw error
            } finally {
                server.close()
            }
        })

    })

    describe('request', async () => {

        test('Sem metodos', async () => {
            const { server } = await createServerForTests('message')

            try {
                const methods = {}
                const client = socketClient.createClient({ url: `http://localhost:3100`, methods })
                await client.waitSinchronization()

                const targetName = 'client'
                const call = 'test'
                const payload = { test: true }
                try {
                    const result = await client.request(targetName, call, payload)
                    expect(result).toBeUndefined()
                } catch (error: any) {
                    expect(error).toBeDefined()
                    expect(error.message).toBe('Method not found test')
                }

                client.disconnect()
            } catch (error) {
                throw error
            } finally {
                server.close()
            }

        })

        test('Com metodos', async () => {
            const { server } = await createServerForTests('message')

            try {
                const methods = { test: async (payload: any) => ({ ...payload, test2: true }) }
                const client = socketClient.createClient({ url: `http://localhost:3100`, methods })
                await client.waitSinchronization()

                const targetName = 'client'
                const call = 'test'
                const payload = { test: true }
                const result = await client.request(targetName, call, payload)
                expect(result).toBeDefined()
                expect(result).toHaveProperty('test', true)
                expect(result).toHaveProperty('test2', true)

                client.disconnect()
            } catch (error) {
                throw error
            } finally {
                server.close()
            }
        })

        test('Com metodos e retorno de erro', async () => {
            const { server } = await createServerForTests('message')

            try {
                const methods = {
                    string: async () => { throw 'Test Error' },
                    object: async () => { throw { message: 'Test Error' } },
                    errorClass: async () => { throw new Error('Test Error') },
                    complex: async () => { throw { message: 'Test Error', code: 500 } }
                }
                const client = socketClient.createClient({ url: `http://localhost:3100`, methods })
                await client.waitSinchronization()

                const targetName = 'client'
                try {
                    await client.request(targetName, 'string')
                } catch (error: any) {
                    expect(error).toBeDefined()
                    expect(error).toEqual('Test Error')
                }

                try {
                    await client.request(targetName, 'object')
                } catch (error: any) {
                    expect(error).toBeDefined()
                    expect(error).toEqual({ message: 'Test Error' })
                }

                try {
                    await client.request(targetName, 'errorClass')
                } catch (error: any) {
                    expect(error).toBeDefined()
                    expect(error).toEqual(new Error('Test Error'))
                }

                try {
                    await client.request(targetName, 'complex')
                } catch (error: any) {
                    expect(error).toBeDefined()
                    expect(error).toEqual({ message: 'Test Error', code: 500 })
                }

                client.disconnect()
            } catch (error) {
                throw error
            } finally {
                server.close()
            }
        })

        test('Após reconectar', async () => {
            const reactName = 'react-interface'

            const server = await socketServer.createServer(3100)

            const coreClient = socketClient.createClient({ name: 'core-application', url: `http://localhost:3100` })

            const methods = { refresh: async (sourceId: string) => sourceId }

            try {
                const reactClient = socketClient.createClient({ name: reactName, url: `http://localhost:3100`, methods })
                await reactClient.waitSinchronization()

                const sourceId = random.string()
                const result = await coreClient.request(reactName, 'refresh', sourceId)
                expect(result).toBeDefined()
                expect(result).toBe(sourceId)

                reactClient.disconnect()

            } catch (error) {
                throw error
            }

            try {

                const reactClient = socketClient.createClient({ name: reactName, url: `http://localhost:3100`, methods })
                await reactClient.waitSinchronization()

                const sourceId = random.string()
                const result = await coreClient.request(reactName, 'refresh', sourceId)
                expect(result).toBeDefined()
                expect(result).toBe(sourceId)

                reactClient.disconnect()
            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

            coreClient.disconnect()
        })

        test('múltiplos clients', async () => {
            const reactName = 'react-interface'
            const serverPort = 3101
            const server = await socketServer.createServer(serverPort, {
                rules: {
                    [reactName]: { allowMultiple: true }
                }
            })

            const calls1: string[] = []
            const calls2: string[] = []

            const methods1 = { refresh: async (sourceId: string) => calls1.push(sourceId) }
            const methods2 = { refresh: async (sourceId: string) => calls2.push(sourceId) }

            const coreClient = socketClient.createClient({ name: 'core-application', url: `http://localhost:${serverPort}` })
            const reactClient1 = socketClient.createClient({ name: reactName, url: `http://localhost:${serverPort}`, methods: methods1 })
            const reactClient2 = socketClient.createClient({ name: reactName, url: `http://localhost:${serverPort}`, methods: methods2 })

            try {
                await reactClient1.waitSinchronization()
                await reactClient2.waitSinchronization()

                expect(calls1).toStrictEqual([])
                expect(calls2).toStrictEqual([])

                const sourceId1 = random.string()
                const result1 = await coreClient.request(reactName, 'refresh', sourceId1)
                expect(result1).not.toBeDefined()
                expect(calls1).toStrictEqual([sourceId1])
                expect(calls2).toStrictEqual([sourceId1])

                const sourceId2 = random.string()
                const result2 = await coreClient.request(reactName, 'refresh', sourceId2)
                expect(result2).not.toBeDefined()
                expect(calls1).toStrictEqual([sourceId1, sourceId2])
                expect(calls2).toStrictEqual([sourceId1, sourceId2])

                reactClient1.disconnect()
                reactClient2.disconnect()

            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

        })

    })

    describe('Estados', () => {

        describe('setState', () => {

            test('valor vazio', async () => {
                const client = socketClient.createClient({ url: `http://localhost:3100`, name: random.string() })
                try {
                    await socketClient.createClient({ url: `http://localhost:3100` }).setState({})
                } catch (error) {
                    expect(error).toBeDefined()
                    expect(error).toBe('Value must have at least one key')
                } finally {
                    client.disconnect()
                }
            })

            test('valor incorreto', async () => {

                async function setState(value?: any) {
                    const client = socketClient.createClient({ url: `http://localhost:3100`, name: random.string() })
                    try {
                        await client.setState(value)
                    } catch (error) {
                        expect(error).toBeDefined()
                        expect(error).toBe('Value must be an object')
                    } finally {
                        client.disconnect()
                    }
                }

                await setState()
                await setState(true)
                await setState([])
                await setState(null)
                await setState(1)
                await setState('test')

            })

            test('valor correto', async () => {
                const { server } = await createServerForTests('message')
                const client = socketClient.createClient({ url: `http://localhost:3100`, name: random.string() })
                try {
                    await client.waitSinchronization()
                    const value = { test: true }
                    const states = await client.setState(value)
                    expect(states).toEqual(value)
                } catch (error) {
                    throw error
                } finally {
                    server.close()
                    client.disconnect()
                }
            })

        })

        describe('getState', () => {

            test('sem chave', async () => {

                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100` })
                    await client.setState({ test: true })
                    const result = client.getState()
                    expect(result).toEqual({ test: true })
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                }
            })

            test('com chave', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100` })
                    await client.setState({ test: true })
                    const result = client.getState('test')
                    expect(result).toEqual(true)
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                }
            })

            test('chave inexistente', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100` })
                    await client.setState({ test: true })
                    const result = client.getState('test2')
                    expect(result).toBeUndefined()
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                }
            })

            test('get após modificação', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100` })
                    await client.setState({ test: true })
                    expect(client.getState('test')).toEqual(true)
                    await client.setState({ test2: 'true-true' })
                    expect(client.getState('test')).toEqual(true)
                    expect(client.getState('test2')).toEqual('true-true')
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                }
            })

        })

        describe('modificar state no server', () => {

            test('verifica se o estado é registrado', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-register-state' })
                    await client.waitSinchronization()
                    await client.setState({ test: true })
                    const result = client.getState()
                    expect(result).toEqual({ test: true })
                    const clientId = client.getSocket().id
                    expect(internalMethods.getState(clientId, 'test')).toEqual(true)
                    expect(internalMethods.getState(clientId, 'test2')).toEqual(undefined)
                    await client.setState({ test: 'false', test2: true })
                    expect(internalMethods.getState(clientId, 'test')).toEqual('false')
                    expect(internalMethods.getState(clientId, 'test2')).toEqual(true)
                    await client.setState({ test2: false })
                    expect(internalMethods.getState(clientId, 'test')).toEqual('false')
                    expect(internalMethods.getState(clientId, 'test2')).toEqual(false)
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                }
            })

        })

        describe('sincronização de estados', () => {

            test('testa listeners', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen' })
                    await client.waitSinchronization()
                    await client.setState({ testValue: 'initialization' })
                    const result = client.getState()
                    expect(result).toEqual({ testValue: 'initialization' })
                    const clientId = client.getSocket().id
                    const fn = vi.fn()
                    let receivedValue = undefined
                    const callback = (value: any) => {
                        receivedValue = value
                        fn()
                    }

                    const result2 = await client.listenState('client-listen', 'testValue', callback)
                    expect(typeof result2).toBe('string')
                    expect(fn).toHaveBeenCalledTimes(1)
                    expect(receivedValue).toBe('initialization')
                    await client.setState({ testValue: false })
                    expect(fn).toHaveBeenCalledTimes(2)
                    expect(receivedValue).toBe(false)
                    await client.setState({ testValue: 'test' })
                    expect(fn).toHaveBeenCalledTimes(3)
                    expect(receivedValue).toBe('test')
                    await client.setState({ testValue: [1, 2, 3] })
                    expect(fn).toHaveBeenCalledTimes(4)
                    expect(receivedValue).toEqual([1, 2, 3])
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                }
            })

            test('testa múltiplos estados e múltiplos listeners', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client1 = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen1' })
                    const client2 = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen2' })
                    const client3 = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen3' })

                    await client1.waitSinchronization()
                    await client2.waitSinchronization()
                    await client3.waitSinchronization()

                    const [fn1, fn2, fn3] = [vi.fn(), vi.fn(), vi.fn()]
                    let [receivedValue1, receivedValue2, receivedValue3] = [undefined, undefined, undefined]
                    const callback1 = (value: any) => { receivedValue1 = value; fn1() }
                    const callback2 = (value: any) => { receivedValue2 = value; fn2() }
                    const callback3 = (value: any) => { receivedValue3 = value; fn3() }

                    await client2.listenState('client-listen1', 'testValue', callback2)
                    await client3.listenState('client-listen1', 'testValue', callback3)
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(1)
                    expect(fn3).toHaveBeenCalledTimes(1)
                    await client1.setState({ testValue: false })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(2)
                    expect(fn3).toHaveBeenCalledTimes(2)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe(false)
                    expect(receivedValue3).toBe(false)
                    await client1.setState({ testValue: 'test' })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(3)
                    expect(fn3).toHaveBeenCalledTimes(3)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe('test')
                    await client3.listenState('client-listen2', 'whatsapp-status', callback3)
                    await client2.setState({ 'whatsapp-status': 'online' })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(3)
                    expect(fn3).toHaveBeenCalledTimes(5)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe('online')
                    await client1.setState({ testValue: [1, 2, 3] })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(4)
                    expect(fn3).toHaveBeenCalledTimes(6)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toEqual([1, 2, 3])
                    expect(receivedValue3).toEqual([1, 2, 3])
                    await client1.listenState('client-listen2', 'page', callback1)
                    await client2.setState({ page: 'home' })
                    expect(fn1).toHaveBeenCalledTimes(2)
                    expect(fn2).toHaveBeenCalledTimes(4)
                    expect(fn3).toHaveBeenCalledTimes(6)
                    expect(receivedValue1).toBe('home')
                    expect(receivedValue2).toEqual([1, 2, 3])
                    expect(receivedValue3).toEqual([1, 2, 3])

                    client1.disconnect()
                    client2.disconnect()
                    client3.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                }
            })

        })

    })

    describe('Cenários', () => {

        test('3 clientes', async () => {

            const { server } = await createServerForTests('message')

            try {
                function multiplication(...args: number[]) {
                    return args.reduce((acc, value) => acc * value, 1)
                }

                function sum(...args: number[]) {
                    return args.reduce((acc, value) => acc + value, 0)
                }

                const methods = { multiplication, sum }

                const serverUrl = `http://localhost:3100`
                const client1 = socketClient.createClient({ url: serverUrl, methods, name: 'client1' })
                const client2 = socketClient.createClient({ url: serverUrl, methods, name: 'client2' })
                const client3 = socketClient.createClient({ url: serverUrl, methods, name: 'client3' })

                const clients = [client1, client2, client3]

                await Promise.all(clients.map(client => client.waitSinchronization()))

                await Promise.all(clients.map(async client => {
                    for (let index = 0; index < 3; index++) {
                        const targetName = `client${index + 1}`
                        const result1 = await client.request(targetName, 'multiplication', 2, 3, 4)
                        expect(result1).toBe(24)
                        const result2 = await client.request(targetName, 'sum', 2, 3, 4)
                        expect(result2).toBe(9)
                    }
                }))


                client1.disconnect()
                client2.disconnect()
                client3.disconnect()
            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

        })

        test('Nomes iguais', async () => {

            const { server } = await createServerForTests()

            try {

                const onDuplicated = vi.fn()
                const serverUrl = `http://localhost:3100`
                const client1 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
                const client2 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
                const client3 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })

                await Promise.all([client1, client2, client3].map(client => client.waitSinchronization()))

                expect(onDuplicated).toHaveBeenCalledTimes(2)

                client1.disconnect()
                client2.disconnect()
                client3.disconnect()

            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

        })

        test('Nomes iguais com allowMultiple = true', async () => {

            const server = await socketServer.createServer(3100, { rules: { 'client': { allowMultiple: true } } })
            expect(server.engine.clientsCount).toBe(0)

            try {

                const onDuplicated = vi.fn()
                const serverUrl = `http://localhost:3100`
                const client1 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
                const client2 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
                const client3 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })

                await Promise.all([client1, client2, client3].map(client => client.waitSinchronization()))

                expect(onDuplicated).toHaveBeenCalledTimes(0)

                client1.disconnect()
                client2.disconnect()
                client3.disconnect()

            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

        })

        test('Notifica multiplas conexões', async () => {

            const server = await socketServer.createServer(3100, { rules: { 'client': { allowMultiple: true } } })
            expect(server.engine.clientsCount).toBe(0)

            try {

                const onDuplicated = vi.fn()
                const serverUrl = `http://localhost:3100`
                const originEvent = socketClient.createClient({ url: serverUrl, name: 'origin', onDuplicated, states: { test: 'Hello World!' } })
                const client1 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
                const client2 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
                const client3 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })

                await Promise.all([client1, client2, client3, originEvent].map(client => client.waitSinchronization()))

                expect(onDuplicated).toHaveBeenCalledTimes(0)

                const fn = vi.fn()

                client1.listenState('origin', 'test', fn)
                client2.listenState('origin', 'test', fn)
                client3.listenState('origin', 'test', fn)

                await delay(500)

                expect(fn).toHaveBeenCalledTimes(3)
                expect(fn).toHaveBeenNthCalledWith(1, 'Hello World!', 'origin:test')
                expect(fn).toHaveBeenNthCalledWith(2, 'Hello World!', 'origin:test')
                expect(fn).toHaveBeenNthCalledWith(3, 'Hello World!', 'origin:test')

                await originEvent.setState({ test: 'Hello World! 2' })

                await delay(500)

                expect(fn).toHaveBeenCalledTimes(6)
                expect(fn).toHaveBeenNthCalledWith(4, 'Hello World! 2', 'origin:test')
                expect(fn).toHaveBeenNthCalledWith(5, 'Hello World! 2', 'origin:test')
                expect(fn).toHaveBeenNthCalledWith(6, 'Hello World! 2', 'origin:test')

                originEvent.disconnect()
                client1.disconnect()
                client2.disconnect()
                client3.disconnect()

            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

        })


        test('Desconexão', async () => {

            const { server } = await createServerForTests()

            try {

                const serverUrl = `http://localhost:3100`
                const client1 = socketClient.createClient({ url: serverUrl })
                const client2 = socketClient.createClient({ url: serverUrl })
                const client3 = socketClient.createClient({ url: serverUrl })

                const clients = [client1, client2, client3]

                await Promise.all(clients.map(client => client.waitSinchronization()))

                await delay(150)

                expect(client1.isConnected()).toBe(true)
                expect(client2.isConnected()).toBe(false)
                expect(client3.isConnected()).toBe(false)
                client1.disconnect()
            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

        })

        test('server offline', async () => {

            const methods1 = { call: vi.fn() }
            const methods2 = { call: vi.fn() }

            const serverUrl = `http://localhost:3100`
            const client1 = socketClient.createClient({ url: serverUrl, methods: methods1, name: 'client1' })
            const client2 = socketClient.createClient({ url: serverUrl, methods: methods2, name: 'client2' })

            expect(client1.isConnected()).toBe(false)
            expect(client2.isConnected()).toBe(false)

            await delay(100)

            expect(client1.isConnected()).toBe(false)
            expect(client2.isConnected()).toBe(false)

            const { server } = await createServerForTests()
            let time = 0
            try {
                await client1.waitSinchronization()
                await client2.waitSinchronization()

                expect(client1.isConnected()).toBe(true)
                expect(client2.isConnected()).toBe(true)

                const lastTime = Date.now()
                await Promise.all([
                    client1.request('client2', 'call', true),
                    client1.request('client2', 'call', true),
                    client2.request('client1', 'call', true),
                ])
                time = Date.now() - lastTime

                expect(methods2.call).toHaveBeenCalledTimes(2)
                expect(methods1.call).toHaveBeenCalledTimes(1)
            } catch (error) {
                throw error
            } finally {
                await server.close()
            }

            const request1 = client1.request('client2', 'call', 'reconect test')
            const request2 = client2.request('client1', 'call', 'reconect test')

            await delay(time * 2)

            expect(methods2.call).toHaveBeenCalledTimes(2)
            expect(methods1.call).toHaveBeenCalledTimes(1)

            const { server: server2 } = await createServerForTests()

            try {
                await Promise.all([
                    (async () => {
                        await client1.waitSinchronization()
                        expect(methods2.call).toHaveBeenCalledTimes(2)
                    })(),
                    (async () => {
                        await client2.waitSinchronization()
                        expect(methods1.call).toHaveBeenCalledTimes(1)
                    })(),
                ])

                await request1
                await request2

                expect(methods2.call).toHaveBeenCalledTimes(3)
                expect(methods1.call).toHaveBeenCalledTimes(2)

                client1.disconnect()
                client2.disconnect()

            } catch (error) {
                console.log('error', error)
                throw error
            } finally {
                await server2.close()
            }

        }, 10000)

        describe('testa sincronização pós server offline', async () => {

            const [fn1, fn2, fn3] = [vi.fn(), vi.fn(), vi.fn()]
            let [receivedValue1, receivedValue2, receivedValue3] = [undefined, undefined, undefined]
            const callback1 = (value: any) => { receivedValue1 = value; fn1() }
            const callback2 = (value: any) => { receivedValue2 = value; fn2() }
            const callback3 = (value: any) => { receivedValue3 = value; fn3() }
            const client1 = socketClient.createClient({ url: `http://localhost:3102`, name: 'client-listen-1' })
            const client2 = socketClient.createClient({ url: `http://localhost:3102`, name: 'client-listen-2' })

            test('Estágio 1', async () => {
                const { server } = await createServerForTests(3102, 'message')
                try {
                    await client1.waitSinchronization()
                    await client2.waitSinchronization()

                    await client2.listenState('client-listen-1', 'testValue', callback3)

                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(0)
                    expect(fn3).toHaveBeenCalledTimes(1)

                    await client1.setState({ testValue: false })

                    expect(internalMethods.getState(client1.getSocket().id, 'testValue')).toBe(false)
                    expect(internalMethods.getState(client1.getSocket().id, 'testValue2')).toBe(undefined)
                    expect(internalMethods.getState(client2.getSocket().id, 'whatsAppStatus')).toBe(undefined)
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(0)
                    expect(fn3).toHaveBeenCalledTimes(2)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe(undefined)
                    expect(receivedValue3).toBe(false)

                } catch (error) {
                    throw error
                } finally {
                    await server.close()
                    _clearAllStates()
                    await delay(20)
                }
            })

            test('Teste de limpeza', async () => {
                try {
                    internalMethods.getState(client1.getSocket().id, 'testValue')
                    expect(true).toBe(false)
                } catch (error) { expect(error).toBe('Client id is required') }
                try {
                    internalMethods.getState(client2.getSocket().id, 'testValue')
                    expect(true).toBe(false)
                } catch (error) { expect(error).toBe('Client id is required') }
            })


            test('Estágio 2', async () => {
                const { server: server2 } = await createServerForTests(3102, 'message')

                try {
                    await client1.waitSinchronization()
                    await client2.waitSinchronization()
                    await delay(200)

                    expect(internalMethods.getState(client1.getSocket().id, 'testValue')).toBe(false)
                    expect(internalMethods.getState(client1.getSocket().id, 'testValue2')).toBe(undefined)
                    expect(internalMethods.getState(client2.getSocket().id, 'whatsAppStatus')).toBe(undefined)
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(0)
                    expect(fn3).toHaveBeenCalledTimes(4)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe(undefined)
                    expect(receivedValue3).toBe(false)

                    await client1.setState({ testValue2: 'test' })

                    expect(internalMethods.getState(client1.getSocket().id, 'testValue')).toBe(false)
                    expect(internalMethods.getState(client1.getSocket().id, 'testValue2')).toBe('test')
                    expect(internalMethods.getState(client2.getSocket().id, 'whatsAppStatus')).toBe(undefined)
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(0)
                    expect(fn3).toHaveBeenCalledTimes(4)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe(undefined)
                    expect(receivedValue3).toBe(false)

                    await client2.listenState('client-listen-1', 'testValue2', callback2)

                    expect(internalMethods.getState(client1.getSocket().id, 'testValue')).toBe(false)
                    expect(internalMethods.getState(client1.getSocket().id, 'testValue2')).toBe('test')
                    expect(internalMethods.getState(client2.getSocket().id, 'whatsAppStatus')).toBe(undefined)
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(1)
                    expect(fn3).toHaveBeenCalledTimes(4)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe(false)

                } catch (error) {
                    throw error
                } finally {
                    await server2.close()
                    await delay(100)
                }
            })


            test('Estágio 3', async () => {
                const { server: server3 } = await createServerForTests(3102, 'message')

                try {
                    await client1.waitSinchronization()
                    await client2.waitSinchronization()
                    await delay(20)

                    expect(internalMethods.getState(client1.getSocket().id, 'testValue')).toBe(false)
                    expect(internalMethods.getState(client1.getSocket().id, 'testValue2')).toBe('test')
                    expect(internalMethods.getState(client2.getSocket().id, 'whatsAppStatus')).toBe(undefined)
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(3)
                    expect(fn3).toHaveBeenCalledTimes(6)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe(false)

                    await client1.listenState('client-listen-2', 'whatsAppStatus', callback1)

                    expect(internalMethods.getState(client1.getSocket().id, 'testValue')).toBe(false)
                    expect(internalMethods.getState(client1.getSocket().id, 'testValue2')).toBe('test')
                    expect(internalMethods.getState(client2.getSocket().id, 'whatsAppStatus')).toBe(undefined)
                    expect(fn1).toHaveBeenCalledTimes(1)
                    expect(fn2).toHaveBeenCalledTimes(3)
                    expect(fn3).toHaveBeenCalledTimes(6)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe(false)

                    await client2.setState({ whatsAppStatus: 'connected' })

                    expect(internalMethods.getState(client1.getSocket().id, 'testValue')).toBe(false)
                    expect(internalMethods.getState(client1.getSocket().id, 'testValue2')).toBe('test')
                    expect(internalMethods.getState(client2.getSocket().id, 'whatsAppStatus')).toBe('connected')
                    expect(fn1).toHaveBeenCalledTimes(2)
                    expect(fn2).toHaveBeenCalledTimes(3)
                    expect(fn3).toHaveBeenCalledTimes(6)
                    expect(receivedValue1).toBe('connected')
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe(false)

                    client1.disconnect()
                    client2.disconnect()

                } catch (error) {
                    throw error
                } finally {
                    await server3.close()
                }

            })

        })

    })

})