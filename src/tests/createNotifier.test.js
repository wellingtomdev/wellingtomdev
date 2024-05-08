import { describe, expect, test } from 'vitest'
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
            let counter = 0
            const listener = () => counter++
            notifier.subscribe(listener)
            notifier.subscribe(listener)
            notifier.notifyAll()
            expect(counter).toBe(2)
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

        test('Deve remover todos os listeners', () => {
            const notifier = createNotifier()
            notifier.subscribe()
            notifier.subscribe()
            notifier.unsubscribeAll()
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

    })

})