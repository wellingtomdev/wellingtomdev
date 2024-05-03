import { describe, test, expect } from 'vitest'
import getObjectId from './index'


describe('getObjectId', () => {

    describe('string vazia', () => {

        test('deve retornar uma string vazia', () => {
            const result = getObjectId()
            expect(result).toBe('')
        })

        test('deve retornar uma string vazia', () => {
            const result = getObjectId({})
            expect(result).toBe('')
        })

    })

    describe('valores simples', () => {

        test('deve retornar exatamente os valores de a e b', () => {
            const result = getObjectId({ a: 1, b: 2 })
            expect(result).toBe('1-2')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ a: 1, b: 2, c: 3 })
            expect(result).toBe('1-2-3')
        })

    })

    describe('fora de ordem', () => {

        test('deve retornar exatamente os valores de a e b', () => {
            const result = getObjectId({ b: 2, a: 1 })
            expect(result).toBe('1-2')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ b: 2, a: 1, c: 3 })
            expect(result).toBe('1-2-3')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ c: 3, a: 1, b: 2 })
            expect(result).toBe('1-2-3')
        })

    })

    describe('valores aninhados', () => {   

        test('deve retornar exatamente os valores de a e b', () => {
            const result = getObjectId({ a: 1, b: { c: 2 } })
            expect(result).toBe('1-2')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ a: 1, b: { c: 2 }, d: 3 })
            expect(result).toBe('1-2-3')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ a: 1, b: { c: 2, d: 3 } })
            expect(result).toBe('1-2-3')
        })

    })

    describe('valores duplamente aninhados', () => {
        
        test('deve retornar exatamente os valores de a e b', () => {
            const result = getObjectId({ a: 1, b: { c: 2, d: { e: 3 } } })
            expect(result).toBe('1-2-3')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ a: 1, b: { c: 2, d: { e: 3 }, f: 4 } })
            expect(result).toBe('1-2-3-4')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ a: 1, b: { c: 2, d: { e: 3, f: 4 } } })
            expect(result).toBe('1-2-3-4')
        })

    })

    describe('valores com arrays', () => {

        test('deve retornar exatamente os valores de a e b', () => {
            const result = getObjectId({ a: 1, b: [2, 3] })
            expect(result).toBe('1-2-3')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ a: 1, b: [2, 3], c: 4 })
            expect(result).toBe('1-2-3-4')
        })

        test('deve retornar exatamente os valores de a, b e c', () => {
            const result = getObjectId({ a: 1, b: [2, 3, 4] })
            expect(result).toBe('1-2-3-4')
        })

    })



})