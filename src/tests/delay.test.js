import { describe, expect, test } from 'vitest'
import delay from '../modules/delay'

describe('delay', () => {

    test('Deve retornar uma Promise', () => {
        const result = delay(10)
        expect(result instanceof Promise).toBe(true)
    })

    test('Deve resolver a Promise após o tempo especificado', async () => {
        const start = Date.now()
        await delay(11)
        const end = Date.now()
        expect(end - start).toBeGreaterThanOrEqual(11)
    })

    test('Deve resolver as duas Promises após o tempo especificado', async () => {
        const start = Date.now()
        await delay(23)
        await delay(40)
        const end = Date.now()
        expect(end - start).toBeGreaterThanOrEqual(63)
    })

    test('Testa margem de erro', async () => {
        const times = []
        const promises = []
        const timeDelay = 100
        const calls = 10000
        for (let i = 0; i < calls; i++) {
            promises.push((async ()=>{
                const start = Date.now()
                await delay(timeDelay)
                const end = Date.now()
                times.push(end - start)
            })())
        }
        await Promise.all(promises)
        const average = times.reduce((acc, time) => acc + time, 0) / times.length
        expect(average).toBeGreaterThanOrEqual(timeDelay)
        expect(average).toBeLessThanOrEqual(timeDelay + 20)
    })

})