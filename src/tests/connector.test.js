import { describe, expect, test, vi } from 'vitest'
import socketServer from '../modules/connector/server'
import socketClient from '../modules/connector/client'
import delay from '../modules/delay'

describe('socketServer', () => {

    test('Inicialização', () => {
        expect(true).toBe(true)
    })

    describe('createServer', () => {

        test('Métodos', () => {
            expect(socketServer.getSocketServer).toBeDefined()
            expect(socketServer.createServer).toBeDefined()
        })

        test('createServer', async () => {
            const server = await socketServer.createServer({ port: 3001 })
            expect(server).toBeDefined()
            expect(server).toHaveProperty('on')
            expect(server).toHaveProperty('emit')
            server.close()
        })

    })

    async function createServerForTests(...events) {
        const server = await socketServer.createServer({ port: 3001 })
        expect(server.engine.clientsCount).toBe(0)
        const messages = []
        events.forEach(event => server.on(event, (...args) => messages.push({ event, args })))
        return { server, messages }
    }

    describe('createClient', () => {

        test('Conecta a um socket', async () => {
            const { server, messages } = await createServerForTests('connection')

            const client = socketClient.createClient({ url: `http://localhost:3001` })
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
            const client = socketClient.createClient({ url: `http://localhost:3001`, methods })
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
            const client = socketClient.createClient({ url: `http://localhost:3001`, methods })
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

            const serverUrl = `http://localhost:3001`
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

            const { server } = await createServerForTests('message')

            const onDuplicated = vi.fn()
            const serverUrl = `http://localhost:3001`
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

            const { server } = await createServerForTests('message')

            const serverUrl = `http://localhost:3001`
            const client1 = socketClient.createClient({ url: serverUrl })
            const client2 = socketClient.createClient({ url: serverUrl })
            const client3 = socketClient.createClient({ url: serverUrl })

            const clients = [client1, client2, client3]

            await Promise.all(clients.map(client => client.waitConnection()))

            await delay(200)

            expect(client1.isConnected()).toBe(true)
            expect(client2.isConnected()).toBe(false)
            expect(client3.isConnected()).toBe(false)
            client1.disconnect()
            server.close()

        })

    })

})