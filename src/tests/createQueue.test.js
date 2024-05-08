import { describe, expect, test, vi } from 'vitest'
import createQueue from '../modules/createQueue'

describe('createQueue', () => {

    test('Deve retornar um objeto contendo os métodos', () => {
        const queue = createQueue()
        expect(typeof queue).toBe('object')
        expect(typeof queue.getStarted).toBe('function')
        expect(typeof queue.add).toBe('function')
        expect(typeof queue.run).toBe('function')
        expect(typeof queue.start).toBe('function')
        expect(typeof queue.stop).toBe('function')
    })

    describe('Método getStarted', () => {

        test('Deve retornar o valor padrão de state.started', () => {
            const queue = createQueue()
            expect(queue.getStarted()).toBe(true)
        })

        test('Deve retornar false', () => {
            const queue = createQueue({ initStarted: false })
            expect(queue.getStarted()).toBe(false)
        })

        test('Deve retornar true', () => {
            const queue = createQueue({ initStarted: true })
            expect(queue.getStarted()).toBe(true)
        })

    })

    describe('Método start', () => {

        test('Deve iniciar a execução da fila', () => {
            const queue = createQueue({ initStarted: false })
            queue.start()
            expect(queue.getStarted()).toBe(true)
        })

    })

    describe('Método stop', () => {

        test('Deve parar a execução da fila', () => {
            const queue = createQueue()
            queue.stop()
            expect(queue.getStarted()).toBe(false)
        })

    })

    describe('Método add', () => {

        test('Deve adicionar um callback na fila', async () => {
            const queue = createQueue()
            const callback = vi.fn()
            const task = queue.add(callback)
            expect(task.id).toBeDefined()
            expect(typeof task.promise).toBe('object')
            expect(typeof task.promise.then).toBe('function')
            await task.promise
            expect(callback).toHaveBeenCalled()
            expect(callback).toHaveBeenCalledTimes(1)
        })

        test('Deve adicionar um callback que retorna uma Promise na fila', async () => {
            const queue = createQueue()
            const callback = () => Promise.resolve('ok')
            const task = queue.add(callback)
            const result = await task.promise
            expect(result).toBe('ok')
        })

        test('Deve adicionar um callback que é rejeitado na fila', async () => {
            const queue = createQueue()
            const callback = () => { throw new Error('Erro ao executar callback') }
            const task = queue.add(callback)
            try {
                await task.promise
                expect(true).toBe(false)
            } catch (error) {
                expect(error.message).toBe('Erro ao executar callback')
            }
        })

        test('Deve adicionar um callback que retorna uma Promise que é rejeitada na fila', async () => {
            const queue = createQueue()
            const callback = () => Promise.reject(new Error('Erro ao executar callback'))
            const task = queue.add(callback)
            try {
                await task.promise
                expect(true).toBe(false)
            } catch (error) {
                expect(error.message).toBe('Erro ao executar callback')
            }
        })

    })

    describe('Método get', () => {

        test('Deve retornar uma task da fila', async () => {
            const queue = createQueue()
            const callback = vi.fn()
            const task = queue.add(callback)
            expect(queue.get(task.id)).toBeDefined()
        })

        test('Deve retornar undefined para uma task que não existe na fila', () => {
            const queue = createQueue()
            const task = queue.get('task-id')
            expect(task).toBeUndefined()
        })

        
        test('Deve retornar undefined para uma task que já foi executada', async () => {
            const queue = createQueue()
            const callback = vi.fn()
            const task = queue.add(callback)
            expect(queue.get(task.id)).toBeDefined()
            await task.promise
            expect(callback).toHaveBeenCalled()
            expect(queue.get(task.id)).toBeUndefined()
        })

    })

    describe('Método remove', () => {

        test('Deve remover um callback da fila', async () => {
            const queue = createQueue({ initStarted: false })
            const callback = vi.fn()
            const task = queue.add(callback)
            expect(queue.get(task.id)).toBeDefined()
            const result = queue.remove(task.id)
            expect(result).toBe(true)
            expect(queue.get(task.id)).toBeUndefined()
        })

        test('Deve remover um callback que não existe na fila', () => {
            const queue = createQueue()
            const result = queue.remove('task-id')
            expect(result).toBe(false)
        })

    })

})