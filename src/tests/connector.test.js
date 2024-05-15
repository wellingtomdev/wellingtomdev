import { describe, expect, test, vi } from 'vitest'
import socketServer from '../modules/connector/server'
import socketClient from '../modules/connector/client'
import delay from '../modules/delay'
import internalMethods from '../modules/connector/server/internalMethods'
import random from '../modules/random'

describe('socketServer', () => {

    describe('createServer', () => {

        test('Métodos', () => {
            expect(socketServer.getSocketServer).toBeDefined()
            expect(socketServer.createServer).toBeDefined()
        })

        test('createServer', async () => {
            const server = await socketServer.createServer({ port: 3100 })
            expect(server).toBeDefined()
            expect(server).toHaveProperty('on')
            expect(server).toHaveProperty('emit')
            server.close()
        })

    })

    async function createServerForTests(...events) {
        const server = await socketServer.createServer({ port: 3100 })
        expect(server.engine.clientsCount).toBe(0)
        const messages = []
        events.forEach(event => server.on(event, (...args) => messages.push({ event, args })))
        return { server, messages }
    }

    describe('createClient', () => {

        test('Conecta a um socket', async () => {
            const { server, messages } = await createServerForTests('connection')

            const client = socketClient.createClient({ url: `http://localhost:3100` })
            await client.waitConnection()
            expect(messages.length).toBe(1)
            const [message] = messages
            expect(message.event).toBe('connection')
            expect(message.args.length).toBe(1)
            const [socket] = message.args
            expect(socket).toBeDefined()
            expect(socket.id).toBeDefined()

            socket.disconnect()
            server.close()

        })

    })

    describe('request', async () => {

        test('Sem metodos', async () => {
            const { server } = await createServerForTests('message')
            const methods = {}
            const client = socketClient.createClient({ url: `http://localhost:3100`, methods })
            await client.waitConnection()

            const targetName = 'client'
            const call = 'test'
            const payload = { test: true }
            try {
                const result = await client.request(targetName, call, payload)
                expect(result).toBeUndefined()
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.message).toBe('Method not found test')
            }

            server.close()
            client.disconnect()

        })

        test('Com metodos', async () => {
            const { server } = await createServerForTests('message')
            const methods = { test: async (payload) => ({ ...payload, test2: true }) }
            const client = socketClient.createClient({ url: `http://localhost:3100`, methods })
            await client.waitConnection()

            const targetName = 'client'
            const call = 'test'
            const payload = { test: true }
            const result = await client.request(targetName, call, payload)
            expect(result).toBeDefined()
            expect(result).toHaveProperty('test', true)
            expect(result).toHaveProperty('test2', true)

            server.close()
            client.disconnect()

        })

    })

    describe('events', () => {

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

                async function setState(value) {
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
                    await client.waitConnection()
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
                    server.close()
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
                    server.close()
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
                    server.close()
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
                    server.close()
                }
            })

        })

        describe('modificar state no server', () => {

            test('verifica se o estado é registrado', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-register-state' })
                    await client.waitConnection()
                    await client.setState({ test: true })
                    const result = client.getState()
                    expect(result).toEqual({ test: true })
                    const clientId = client.getSocket().id
                    expect(internalMethods.getState(false, clientId, 'test')).toEqual(true)
                    expect(internalMethods.getState(false, clientId, 'test2')).toEqual(undefined)
                    await client.setState({ test: 'false', test2: true })
                    expect(internalMethods.getState(false, clientId, 'test')).toEqual('false')
                    expect(internalMethods.getState(false, clientId, 'test2')).toEqual(true)
                    await client.setState({ test2: false })
                    expect(internalMethods.getState(false, clientId, 'test')).toEqual('false')
                    expect(internalMethods.getState(false, clientId, 'test2')).toEqual(false)
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    server.close()
                }
            })

        })

        describe('sincronização de estados', () => {

            test('testa listeners', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen' })
                    await client.waitConnection()
                    await client.setState({ testValue: true })
                    const result = client.getState()
                    expect(result).toEqual({ testValue: true })
                    const clientId = client.getSocket().id
                    const fn = vi.fn()
                    let receivedValue = undefined
                    const callback = value => {
                        receivedValue = value
                        fn()
                    }

                    const result2 = await client.listenState('client-listen', 'testValue', callback)
                    expect(typeof result2).toBe('string')
                    expect(fn).toHaveBeenCalledTimes(0)
                    await client.setState({ testValue: false })
                    expect(fn).toHaveBeenCalledTimes(1)
                    expect(receivedValue).toBe(false)
                    await client.setState({ testValue: 'test' })
                    expect(fn).toHaveBeenCalledTimes(2)
                    expect(receivedValue).toBe('test')
                    await client.setState({ testValue: [1, 2, 3] })
                    expect(fn).toHaveBeenCalledTimes(3)
                    expect(receivedValue).toEqual([1, 2, 3])
                    client.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    server.close()
                }
            })

            test('testa múltiplos estados e múltiplos listeners', async () => {
                const { server } = await createServerForTests('message')
                try {
                    const client1 = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen1' })
                    const client2 = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen2' })
                    const client3 = socketClient.createClient({ url: `http://localhost:3100`, name: 'client-listen3' })

                    await client1.waitConnection()
                    await client2.waitConnection()
                    await client3.waitConnection()

                    const [fn1, fn2, fn3] = [vi.fn(), vi.fn(), vi.fn()]
                    let [receivedValue1, receivedValue2, receivedValue3] = [undefined, undefined, undefined]
                    const callback1 = value => { receivedValue1 = value; fn1() }
                    const callback2 = value => { receivedValue2 = value; fn2() }
                    const callback3 = value => { receivedValue3 = value; fn3() }

                    await client2.listenState('client-listen1', 'testValue', callback2)
                    await client3.listenState('client-listen1', 'testValue', callback3)
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(0)
                    expect(fn3).toHaveBeenCalledTimes(0)
                    await client1.setState({ testValue: false })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(1)
                    expect(fn3).toHaveBeenCalledTimes(1)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe(false)
                    expect(receivedValue3).toBe(false)
                    await client1.setState({ testValue: 'test' })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(2)
                    expect(fn3).toHaveBeenCalledTimes(2)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe('test')
                    await client3.listenState('client-listen2', 'whatsapp-status', callback3)
                    await client2.setState({ 'whatsapp-status': 'online' })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(2)
                    expect(fn3).toHaveBeenCalledTimes(3)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toBe('test')
                    expect(receivedValue3).toBe('online')
                    await client1.setState({ testValue: [1, 2, 3] })
                    expect(fn1).toHaveBeenCalledTimes(0)
                    expect(fn2).toHaveBeenCalledTimes(3)
                    expect(fn3).toHaveBeenCalledTimes(4)
                    expect(receivedValue1).toBe(undefined)
                    expect(receivedValue2).toEqual([1, 2, 3])
                    expect(receivedValue3).toEqual([1, 2, 3])
                    await client1.listenState('client-listen2', 'page', callback1)
                    await client2.setState({ page: 'home' })
                    expect(fn1).toHaveBeenCalledTimes(1)
                    expect(fn2).toHaveBeenCalledTimes(3)
                    expect(fn3).toHaveBeenCalledTimes(4)
                    expect(receivedValue1).toBe('home')
                    expect(receivedValue2).toEqual([1, 2, 3])
                    expect(receivedValue3).toEqual([1, 2, 3])

                    client1.disconnect()
                    client2.disconnect()
                    client3.disconnect()
                } catch (error) {
                    throw error
                } finally {
                    server.close()
                }
            })

        })

    })

    describe('Cenários', () => {

        test('3 clientes', async () => {

            const { server } = await createServerForTests('message')

            function multiplication(...args) {
                return args.reduce((acc, value) => acc * value, 1)
            }

            function sum(...args) {
                return args.reduce((acc, value) => acc + value, 0)
            }

            const methods = { multiplication, sum }

            const serverUrl = `http://localhost:3100`
            const client1 = socketClient.createClient({ url: serverUrl, methods, name: 'client1' })
            const client2 = socketClient.createClient({ url: serverUrl, methods, name: 'client2' })
            const client3 = socketClient.createClient({ url: serverUrl, methods, name: 'client3' })

            const clients = [client1, client2, client3]

            await Promise.all(clients.map(client => client.waitConnection()))

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
            server.close()

        })

        test('Nomes iguais', async () => {

            const { server } = await createServerForTests()

            const onDuplicated = vi.fn()
            const serverUrl = `http://localhost:3100`
            const client1 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
            const client2 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })
            const client3 = socketClient.createClient({ url: serverUrl, name: 'client', onDuplicated })

            const clients = [client1, client2, client3]

            await Promise.all(clients.map(client => client.waitConnection()))

            expect(onDuplicated).toHaveBeenCalledTimes(2)

            client1.disconnect()
            client2.disconnect()
            client3.disconnect()
            server.close()

        })

        test('Desconexão', async () => {

            const { server } = await createServerForTests()

            const serverUrl = `http://localhost:3100`
            const client1 = socketClient.createClient({ url: serverUrl })
            const client2 = socketClient.createClient({ url: serverUrl })
            const client3 = socketClient.createClient({ url: serverUrl })

            const clients = [client1, client2, client3]

            await Promise.all(clients.map(client => client.waitConnection()))

            await delay(150)

            expect(client1.isConnected()).toBe(true)
            expect(client2.isConnected()).toBe(false)
            expect(client3.isConnected()).toBe(false)
            client1.disconnect()
            server.close()

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

            await client1.waitConnection()
            await client2.waitConnection()

            expect(client1.isConnected()).toBe(true)
            expect(client2.isConnected()).toBe(true)

            const lastTime = Date.now()
            await Promise.all([
                client1.request('client2', 'call', true),
                client1.request('client2', 'call', true),
                client2.request('client1', 'call', true),
            ])
            const time = Date.now() - lastTime

            expect(methods2.call).toHaveBeenCalledTimes(2)
            expect(methods1.call).toHaveBeenCalledTimes(1)

            server.close()

            const request1 = client1.request('client2', 'call', 'reconect test')
            const request2 = client2.request('client1', 'call', 'reconect test')

            await delay(time * 2)

            expect(methods2.call).toHaveBeenCalledTimes(2)
            expect(methods1.call).toHaveBeenCalledTimes(1)

            const { server: server2 } = await createServerForTests()


            await Promise.all([
                (async () => {
                    await client1.waitConnection()
                    expect(methods2.call).toHaveBeenCalledTimes(2)
                })(),
                (async () => {
                    await client2.waitConnection()
                    expect(methods1.call).toHaveBeenCalledTimes(1)
                })(),
            ])

            await request1
            await request2

            expect(methods2.call).toHaveBeenCalledTimes(3)
            expect(methods1.call).toHaveBeenCalledTimes(2)

            client1.disconnect()
            client2.disconnect()
            server2.close()

        }, 10000)

    })

})