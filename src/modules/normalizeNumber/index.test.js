import { describe, expect, test } from 'vitest'
import normalizedNumber from './index.js'

describe('normalizedNumber', () => {

    test('Completo', () => {
        const length_8 = normalizedNumber('552299999999')
        expect(length_8).toEqual('552299999999')
        const length_9 = normalizedNumber('5522999999999')
        expect(length_9).toEqual('5522999999999')
    })

    test('sem o 55', () => {
        const length_8 = normalizedNumber('2299999999')
        expect(length_8).toEqual('552299999999')
        const length_9 = normalizedNumber('22999999999')
        expect(length_9).toEqual('5522999999999')
    })


    test('com prefíxo 015', () => {
        const length_8 = normalizedNumber('0152299999999')
        expect(length_8).toEqual('552299999999')
        const length_9 = normalizedNumber('01522999999999')
        expect(length_9).toEqual('5522999999999')
    })

    test('com prefíxo 15', () => {
        const length_8 = normalizedNumber('152299999999')
        expect(length_8).toEqual('552299999999')
        const length_9 = normalizedNumber('1522999999999')
        expect(length_9).toEqual('5522999999999')
    })


    test('Contato do exterior', () => {
        const length_8 = normalizedNumber('+542299999999')
        expect(length_8).toEqual('542299999999')
        const length_9 = normalizedNumber('+5422999999999')
        expect(length_9).toEqual('5422999999999')
    })

    test('Contato do exterior sem validação de números', () => {
        const result = normalizedNumber('+1 (214) 241-9271', false)
        expect(result).toEqual('12142419271')
    })

    test('Com DDD 15', ()=>{
        const length_8 = normalizedNumber('551599999999')
        expect(length_8).toEqual('551599999999')
        const length_9 = normalizedNumber('5515999999999')
        expect(length_9).toEqual('5515999999999')
    })

    test('Com DDD 15 e sem o 55', ()=>{
        const length_8 = normalizedNumber('1599999999')
        expect(length_8).toEqual('551599999999')
        const length_9 = normalizedNumber('15999999999')
        expect(length_9).toEqual('5515999999999')
    })




})