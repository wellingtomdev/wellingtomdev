import { describe, expect, test } from 'vitest'
import json from '../modules/json.js'

describe('json', () => {

    test('parse', () => {
        const result = json.parse('{"name":"John"}')
        expect(result).toEqual({ name: 'John' })
    })

    test('parse com erro', () => {
        const result = json.parse('{"name":"John}')
        expect(result).toEqual('{"name":"John}')
    })

    test('parse com erro e throwNull', () => {
        const result = json.parse('{"name":"John}', true)
        expect(result).toEqual(null)
    })

    test('stringify', () => {
        const result = json.stringify({ name: 'John' })
        expect(result).toEqual('{"name":"John"}')
    })

    test('stringify com erro', () => {
        const result = json.stringify({ name: 'John', toJSON: () => { throw new Error() } })
        expect(result).toEqual(undefined)
    })

    test('stringify com string', () => {
        const result = json.stringify('{"name":"John"}')
        expect(result).toEqual('{"name":"John"}')
    })

    test('stringify com erro na string', () => {
        const result = json.stringify('{"name":"John}')
        expect(result).toEqual('{"name":"John}')
    })

})