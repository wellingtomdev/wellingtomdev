import { describe, expect, test } from 'vitest'
import sortVersions, { getTypeList } from '../modules/sortVersions'

describe('sortVersions', () => {

    test('one version', () => {
        const versions = ['1']
        expect(sortVersions(versions)).toEqual(['1'])
    })

    test('two versions', () => {
        const versions = ['1.0', '2.0']
        expect(sortVersions(versions)).toEqual(['1.0', '2.0'])
    })

    test('inverted two versions', () => {
        const versions = ['2.0.0', '1.0']
        expect(sortVersions(versions)).toEqual(['1.0', '2.0.0'])
    })

    test('subversions', () => {
        const versions = ['1.0.1', '1.0.0']
        expect(sortVersions(versions)).toEqual(['1.0.0', '1.0.1'])
    })

    test('complex versions', () => {
        const versions = ['1.0.1', '1.0.0', '2.3.9', '2.3.10', '0.7.23', '0.7.22.1', '0.1', '1.4']
        expect(sortVersions(versions)).toEqual(['0.1', '0.7.22.1', '0.7.23', '1.0.0', '1.0.1', '1.4', '2.3.9', '2.3.10'])
    })

    test('array versions', () => {
        const versions = [
            { "version": "0.4.8" },
            { "version": "0.4.5" },
            { "version": "0.4.7" },
            { "version": "0.4.6" }
        ]
        expect(sortVersions(versions)).toEqual([
            { "version": "0.4.5" },
            { "version": "0.4.6" },
            { "version": "0.4.7" },
            { "version": "0.4.8" }
        ])
    })

    test('object versions', () => {
        const versions = {
            "0.4.8": { "version": "0.4.8" },
            "0.4.5": { "version": "0.4.5" },
            "0.4.7": { "version": "0.4.7" },
            "0.4.6": { "version": "0.4.6" }
        }
        expect(sortVersions(versions)).toEqual([
            { "version": "0.4.5" },
            { "version": "0.4.6" },
            { "version": "0.4.7" },
            { "version": "0.4.8" }
        ])
    })

})

describe('getTypeList', ()=>{
   
    test('empty', () => {
        const versions = []
        expect(getTypeList(versions)).toEqual('empty')
    })

    test('object empty', () => {
        const versions = {}
        expect(getTypeList(versions)).toEqual('empty')
    })

    test('object', () => {
        const versions = {
            "0.4.8": { "version": "0.4.8" },
            "0.4.5": { "version": "0.4.5" },
            "0.4.7": { "version": "0.4.7" },
            "0.4.6": { "version": "0.4.6" }
        }
        expect(getTypeList(versions)).toEqual('object')
    })

    test('array', () => {
        const versions = [
            { "version": "0.4.8" },
            { "version": "0.4.5" },
            { "version": "0.4.7" },
            { "version": "0.4.6" }
        ]
        expect(getTypeList(versions)).toEqual('array')
    })

    test('string', () => {
        const versions = ['1.0.1', '1.0.0', '2.3.9', '2.3.10', '0.7.23' ]
        expect(getTypeList(versions)).toEqual('string')
    })

    test('undefined', () => {
        const versions = undefined
        expect(getTypeList(versions)).toEqual('empty')
    })

    test('null', () => {
        const versions = null
        expect(getTypeList(versions)).toEqual('empty')
    })

})