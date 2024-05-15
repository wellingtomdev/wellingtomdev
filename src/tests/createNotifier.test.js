import { describe, expect, test, vi } from 'vitest'
import createNotifier from '../modules/createNotifier'

describe('createNotifier', () => {

    describe('exists', () => {

        test('Deve retornar false se o listener não existir', () => {
            const notifier = createNotifier()
            const result = notifier.exists('id')
            expect(result).toBe(false)
        })

        test('Deve retornar true se o listener existir', () => {
            const notifier = createNotifier()
            const id = notifier.subscribe()
            const result = notifier.exists(id)
            expect(result).toBe(true)
        })

        test('Deve retornar true se o listener existir no evento', () => {
            const notifier = createNotifier()
            const id = notifier.subscribe(() => { }, 'event-1')
            const result1 = notifier.exists(id, 'default')
            expect(result1).toBe(false)
            const result2 = notifier.exists(id, 'event-1')
            expect(result2).toBe(true)
        })

        test('Deve retornar true se o listener existir independente do evento', () => {
            const notifier = createNotifier()
            const id = notifier.subscribe(() => { }, 'event-1')
            const result1 = notifier.exists(id, null)
            expect(result1).toBe(true)
            const result2 = notifier.exists(id, 'default')
            expect(result2).toBe(false)
        })

    })

    describe('subscribe', () => {

        test('Deve retornar um id', () => {
            const notifier = createNotifier()
            const id = notifier.subscribe()
            expect(typeof id).toBe('string')
        })

        test('Deve retornar um id diferente a cada chamada', () => {
            const notifier = createNotifier()
            const id1 = notifier.subscribe()
            const id2 = notifier.subscribe()
            expect(id1).not.toBe(id2)
        })

        test('Deve lançar um erro se o listener não for uma função', () => {
            const notifier = createNotifier()
            expect(() => notifier.subscribe('string')).toThrow()
        })

        test('Deve permitir a subscrição de um listener', () => {
            const notifier = createNotifier()
            const listener = () => { }
            notifier.subscribe(listener)
            expect(notifier.count()).toBe(1)
        })

        test('Deve permitir a subscrição de vários listeners', () => {
            const notifier = createNotifier()
            const listener = () => { }
            notifier.subscribe(listener)
            notifier.subscribe(listener)
            expect(notifier.count()).toBe(2)
        })

        test('Deve permitir a subscrição de vários listeners diferentes', () => {
            const notifier = createNotifier()
            const listener1 = () => { }
            const listener2 = () => { }
            notifier.subscribe(listener1)
            notifier.subscribe(listener2)
            expect(notifier.count()).toBe(2)
        })

    })

    describe('notify', () => {

        test('Deve retornar um erro se o listener não existir', async () => {
            try {
                const notifier = createNotifier()
                await notifier.notify('id', 'data')
                expect(true).toBe(false)
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect(error.message).toBe('Listener not found')
            }
        })

        test('Deve retornar o valor retornado pelo listener', async () => {
            const notifier = createNotifier()
            const listener = (data) => `Hello ${data}`
            const id = notifier.subscribe(listener)
            const result = await notifier.notify(id, 'data')
            expect(result).toBe('Hello data')
        })

        test('Deve retornar o listenerId', async () => {
            const notifier = createNotifier()
            const listener = (data, listenerId) => listenerId
            const id = notifier.subscribe(listener)
            const result = await notifier.notify(id, 'data')
            expect(result).toBe(id)
        })

        test('Deve retornar undefined se o listener lançar um erro', async () => {
            const notifier = createNotifier()
            const listener = () => { throw new Error() }
            const id = notifier.subscribe(listener)
            const result = await notifier.notify(id, 'data', true)
            expect(result).toBe(undefined)
        })

    })

    describe('notifyAll', () => {

        test('Deve chamar o método notify para cada listener', () => {
            const notifier = createNotifier()
            const fn = vi.fn()
            notifier.subscribe(fn)
            notifier.subscribe(fn)
            notifier.notifyAll('data')
            expect(fn).toHaveBeenCalledTimes(2)
            expect(fn).toHaveBeenCalledWith('data', expect.any(String))
        })

        test('Deve chamar o método notify para cada listener de um evento', () => {
            const notifier = createNotifier()
            const fn1 = vi.fn()
            const fn2 = vi.fn()
            notifier.subscribe(fn1, 'event-1')
            notifier.subscribe(fn1, 'event-1')
            notifier.subscribe(fn2, 'event-2')
            notifier.subscribe(fn2, 'event-2')
            notifier.notifyAll(true, 'event-1')
            expect(fn1).toHaveBeenCalledTimes(2)
            expect(fn2).toHaveBeenCalledTimes(0)
            notifier.notifyAll(true, 'event-2')
            expect(fn1).toHaveBeenCalledTimes(2)
            expect(fn2).toHaveBeenCalledTimes(2)
        })

        test('Deve retornar true', () => {
            const notifier = createNotifier()
            const result = notifier.notifyAll()
            expect(result).toBe(true)
        })

        test('Deve retornar true mesmo com o listener lançando um erro', () => {
            const notifier = createNotifier()
            const listener = () => { throw new Error() }
            notifier.subscribe(listener)
            const result = notifier.notifyAll()
            expect(result).toBe(true)
        })

    })

    describe('unsubscribe', () => {

        test('Deve retornar um erro se o listener não existir', () => {
            try {
                const notifier = createNotifier()
                notifier.unsubscribe('id')
                expect(true).toBe(false)
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect(error.message).toBe('Listener not found')
            }
        })

        test('Deve retornar true se o listener for removido', () => {
            const notifier = createNotifier()
            const id = notifier.subscribe()
            const result = notifier.unsubscribe(id)
            expect(result).toBe(true)
        })

        test('Deve remover o listener', () => {
            const notifier = createNotifier()
            const id = notifier.subscribe()
            notifier.unsubscribe(id)
            expect(notifier.count()).toBe(0)
        })

        test('Deve remover o listener correto', () => {
            const notifier = createNotifier()
            const id1 = notifier.subscribe()
            const id2 = notifier.subscribe()
            notifier.unsubscribe(id1)
            expect(notifier.count()).toBe(1)
            expect(notifier.exists(id1)).toBe(false)
            expect(notifier.exists(id2)).toBe(true)
        })

    })

    describe('unsubscribeAll', () => {

        test('Deve remover todos os listeners de um evento', () => {
            const notifier = createNotifier()
            notifier.subscribe(() => { }, 'event-1')
            notifier.subscribe(() => { }, 'event-2')
            notifier.unsubscribeAll('event-1')
            expect(notifier.count('event-1')).toBe(0)
            expect(notifier.count('event-2')).toBe(1)
            notifier.unsubscribeAll('event-2')
            expect(notifier.count('event-2')).toBe(0)
        })

        test('Deve remover todos os listeners', () => {
            const notifier = createNotifier()
            notifier.subscribe(() => { }, 'event-1')
            notifier.subscribe(() => { }, 'event-2')
            expect(notifier.count('event-1')).toBe(1)
            expect(notifier.count('event-2')).toBe(1)
            notifier.unsubscribeAll(null)
            expect(notifier.count('event-1')).toBe(0)
            expect(notifier.count('event-2')).toBe(0)
        })

        test('Deve remover todos os listeners de default event', () => {
            const notifier = createNotifier()
            notifier.subscribe(() => { }, 'event-1')
            notifier.subscribe(() => { }, 'event-2')
            notifier.subscribe(() => { })
            expect(notifier.count('event-1')).toBe(1)
            expect(notifier.count('event-2')).toBe(1)
            expect(notifier.count()).toBe(1)
            notifier.unsubscribeAll()
            expect(notifier.count('event-1')).toBe(1)
            expect(notifier.count('event-2')).toBe(1)
            expect(notifier.count()).toBe(0)
        })

    })

    describe('count', () => {

        test('Deve retornar a quantidade de listeners (0)', () => {
            const notifier = createNotifier()
            expect(notifier.count()).toBe(0)
        })

        test('Deve retornar a quantidade de listeners (2)', () => {
            const notifier = createNotifier()
            notifier.subscribe()
            notifier.subscribe()
            expect(notifier.count()).toBe(2)
        })
        
        test('Deve retornar a quantidade de listeners de um evento', () => {
            const notifier = createNotifier()
            notifier.subscribe(() => { }, 'event-1')
            notifier.subscribe(() => { }, 'event-1')
            notifier.subscribe(() => { }, 'event-2')
            expect(notifier.count('event-1')).toBe(2)
            expect(notifier.count('event-2')).toBe(1)
        })

        test('Deve retornar a quantidade de listeners total', () => {
            const notifier = createNotifier()
            notifier.subscribe(() => { }, 'event-1')
            notifier.subscribe(() => { }, 'event-1')
            notifier.subscribe(() => { }, 'event-2')
            expect(notifier.count(null)).toBe(3)
        })

    })

})