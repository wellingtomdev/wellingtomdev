import { describe, expect, test } from 'vitest'
import getAvailablePort from '../modules/getAvailablePort.js'
import { createServer } from 'http'

function _createServer(port) {
    return new Promise(resolve => {
        const server = createServer((req, res) => res.end())
        server.listen(port, () => resolve(server))
    })
}

describe('getAvailablePort', () => {

    test('Deve retornar um número', async () => {
        const port = await getAvailablePort()
        expect(typeof port).toBe('number')
    })


    test('Deve retornar o valor padrão 3000', async () => {
        const port = await getAvailablePort()
        expect(port).toBe(3000)
    })

    test('Deve retornar um número entre 1000 e 1100', async () => {
        const port = await getAvailablePort(1000)
        expect(port).toBeGreaterThanOrEqual(1000)
        expect(port).toBeLessThanOrEqual(1100)
    })

    test('Deve retornar um número que não está em uso', async () => {
        const available = await getAvailablePort()
        const server = await _createServer(available)
        try {
            const newPort = await getAvailablePort(available)
            expect(newPort).not.toBe(available)
            expect(newPort).toBe(available + 1)
        } catch (error) {
            throw error
        } finally {
            server.close()
        }
    })

})