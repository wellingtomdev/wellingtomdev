import { describe, expect, test } from 'vitest'
import normalizeDate from '.'

describe.only('normalizeDate', () => {

    describe('onlyNumbers', () => {

        test('should return only numbers', () => {
            const onlyNumbers = normalizeDate.onlyNumbers('12/12/2020')
            expect(onlyNumbers).toBe('12122020')
        })

        test('should return initied in 0', () => {
            const onlyNumbers = normalizeDate.onlyNumbers('02/02/2020')
            expect(onlyNumbers).toBe('02022020')
        })

        test('should return empty string', () => {
            const onlyNumbers = normalizeDate.onlyNumbers('')
            expect(onlyNumbers).toBe('')
        })

    })

    describe('normalizeString', () => {

        test('should return only day and month', () => {
            const onlyNumbers = normalizeDate.normalizeString('12/12')
            expect(onlyNumbers).toBe('12/12')
        })

        test('should return day, month and year', () => {
            const onlyNumbers = normalizeDate.normalizeString('12/12/2020')
            expect(onlyNumbers).toBe('12/12/2020')
        })

        test('should return values with two digits', () => {
            const onlyNumbers = normalizeDate.normalizeString('2/5/2020')
            expect(onlyNumbers).toBe('02/05/2020')
        })

        test('should replace partial small year', () => {
            const onlyNumbers = normalizeDate.normalizeString('12/12/20')
            expect(onlyNumbers).toBe('12/12/2020')
        })

        test('should replace partial big year', () => {
            const onlyNumbers = normalizeDate.normalizeString('31/3/44')
            expect(onlyNumbers).toBe('31/03/1944')
        })

        test('should return no letters', () => {
            const onlyNumbers = normalizeDate.normalizeString('12b/1f2/2020a')
            expect(onlyNumbers).toBe('12/12/2020')
        })

        test('should return empty string', () => {
            const onlyNumbers = normalizeDate.normalizeString('')
            expect(onlyNumbers).toBe('')
        })

    })

    describe('normalizeYear', () => {

        test('should return empty string', () => {
            const onlyNumbers = normalizeDate.normalizeYear('')
            expect(onlyNumbers).toBe('')
        })

        test('should return year with 4 digits', () => {
            const onlyNumbers = normalizeDate.normalizeYear('2020')
            expect(onlyNumbers).toBe('2020')
        })

        test('should return year with 4 digits', () => {
            const onlyNumbers = normalizeDate.normalizeYear('20')
            expect(onlyNumbers).toBe('2020')
        })

        test('should return year with 4 digits', () => {
            const onlyNumbers = normalizeDate.normalizeYear('2')
            expect(onlyNumbers).toBe('2002')
        })

        test('should return year with 4 digits', () => {
            const onlyNumbers = normalizeDate.normalizeYear('44')
            expect(onlyNumbers).toBe('1944')
        })

        test('should return throw error', () => {
            expect(() => normalizeDate.normalizeYear('203')).toThrow('Invalid year 203')
        })

        test('should return throw error', () => {
            expect(() => normalizeDate.normalizeYear('4444')).toThrow('Invalid year 4444')
        })


        test('should return throw error', () => {
            expect(() => normalizeDate.normalizeYear('44444')).toThrow('Invalid year 44444')
        })

        test('should return throw error', () => {
            expect(() => normalizeDate.normalizeYear('1899')).toThrow('Invalid year 1899')
        })

    })

    describe('normalizeDayOrMonth', () => {

        test('should return empty string', () => {
            expect(() => normalizeDate.normalizeDayOrMonth('')).toThrow('Invalid date')
        })

        test('should return day or month with 2 digits', () => {
            const onlyNumbers = normalizeDate.normalizeDayOrMonth('1')
            expect(onlyNumbers).toBe('01')
        })

        test('should return day or month with 2 digits', () => {
            const onlyNumbers = normalizeDate.normalizeDayOrMonth('12')
            expect(onlyNumbers).toBe('12')
        })

        test('should return throw error', () => {
            expect(() => normalizeDate.normalizeDayOrMonth('123')).toThrow('Invalid date 123')
        })

    })

})