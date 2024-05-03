import { describe, expect, test } from 'vitest'
import random from '../modules/random.js'

describe('random', () => {

    describe('random.string', () => {

        describe('length', () => {

            test('length padrão', () => {
                expect(random.string().length).toEqual(10)
            })
    
            test('length 5', () => {
                expect(random.string(5).length).toEqual(5)
            })
    
            test('length 15', () => {
                expect(random.string(15).length).toEqual(15)
            })
    
        })
    
        describe('chars', () => {
    
            test('chars padrão', () => {
                const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
                const result = random.string(100)
                const invalidChars = result.split('').filter(char => !chars.includes(char))
                expect(invalidChars).toEqual([])
            })
    
            test('chars 01', () => {
                const chars = '01'
                const result = random.string(100, chars)
                const invalidChars = result.split('').filter(char => !chars.includes(char))
                expect(invalidChars).toEqual([])
            })
    
            test('chars 123', () => {
                const chars = '123'
                const result = random.string(100, chars)
                const invalidChars = result.split('').filter(char => !chars.includes(char))
                expect(invalidChars).toEqual([])
            })
    
        })
    
        describe('randomness', () => {
    
            test('randomness', () => {
                const result1 = random.string(100)
                const result2 = random.string(100)
                expect(result1).not.toEqual(result2)
            })
    
            test('randomness 2', () => {
                const result1 = random.string(100, '01')
                const result2 = random.string(100, '01')
                expect(result1).not.toEqual(result2)
            })
    
        })
    
        describe('performance', () => {
    
            test('performance', () => {
                const start = Date.now()
                random.string(100000)
                const end = Date.now()
                expect(end - start).toBeLessThan(30)
            })
    
        })

    })

    

})