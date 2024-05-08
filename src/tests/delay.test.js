import { describe, expect, test } from 'vitest'
import delay from '../modules/delay'

describe('delay', () => {

    test('Deve retornar uma Promise', () => {
        const result = delay(1000)
        expect(result instanceof Promise).toBe(true)
    })  

    test('Deve resolver a Promise após o tempo especificado', async () => {
        const start = Date.now()
        await delay(100)
        const end = Date.now()
        expect(end - start).toBeGreaterThanOrEqual(100)
    })

})