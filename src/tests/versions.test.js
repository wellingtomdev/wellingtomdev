import { describe, expect, test } from 'vitest'
import versions from '../modules/versions'
const { sortVersions, getLatestVersion, getTypeList, sanitizeVersionKey } = versions

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

describe('getTypeList', () => {

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
        const versions = ['1.0.1', '1.0.0', '2.3.9', '2.3.10', '0.7.23']
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

describe('getLatestVersion', () => {

    test('empty', () => {
        const versions = []
        expect(getLatestVersion(versions)).toEqual(undefined)
    })

    test('object empty', () => {
        const versions = {}
        expect(getLatestVersion(versions)).toEqual(undefined)
    })

    test('object', () => {
        const versions = {
            "0.4.8": { "version": "0.4.8" },
            "0.4.5": { "version": "0.4.5" },
            "0.4.7": { "version": "0.4.7" },
            "0.4.6": { "version": "0.4.6" }
        }
        expect(getLatestVersion(versions)).toEqual({ "version": "0.4.8" })
    })

    test('array', () => {
        const versions = [
            { "version": "0.4.8" },
            { "version": "0.4.5" },
            { "version": "0.4.7" },
            { "version": "0.4.6" }
        ]
        expect(getLatestVersion(versions)).toEqual({ "version": "0.4.8" })
    })

    test('string', () => {
        const versions = ['1.0.1', '1.0.0', '2.3.9', '2.3.10', '0.7.23']
        expect(getLatestVersion(versions)).toEqual('2.3.10')
    })

    test('undefined', () => {
        const versions = undefined
        expect(getLatestVersion(versions)).toEqual(undefined)
    })

    test('null', () => {
        const versions = null
        expect(getLatestVersion(versions)).toEqual(undefined)
    })

})

describe('sanitizeVersionKey', () => {

    test('empty', () => {
        expect(sanitizeVersionKey('')).toEqual(null)
    })

    test('undefined', () => {
        expect(sanitizeVersionKey(undefined)).toEqual(null)
    })

    test('null', () => {
        expect(sanitizeVersionKey(null)).toEqual(null)
    })

    test('string', () => {
        expect(sanitizeVersionKey('1.0.1')).toEqual('1.0.1')
        expect(sanitizeVersionKey('001.0.1')).toEqual('1.0.1')
        expect(sanitizeVersionKey('1.00.1')).toEqual('1.0.1')
        expect(sanitizeVersionKey('1.00.190')).toEqual('1.0.190')
        expect(sanitizeVersionKey('1.030.1')).toEqual('1.30.1')
    })

    test('number', () => {
        try {
            sanitizeVersionKey(100)
            expect(false).toEqual(true)
        } catch (error) {
            expect(true).toEqual(true)
        }
    })

})