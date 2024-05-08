"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const _1 = __importDefault(require("."));
vitest_1.describe.only('normalizeDate', () => {
    (0, vitest_1.describe)('onlyNumbers', () => {
        (0, vitest_1.test)('should return only numbers', () => {
            const onlyNumbers = _1.default.onlyNumbers('12/12/2020');
            (0, vitest_1.expect)(onlyNumbers).toBe('12122020');
        });
        (0, vitest_1.test)('should return initied in 0', () => {
            const onlyNumbers = _1.default.onlyNumbers('02/02/2020');
            (0, vitest_1.expect)(onlyNumbers).toBe('02022020');
        });
        (0, vitest_1.test)('should return empty string', () => {
            const onlyNumbers = _1.default.onlyNumbers('');
            (0, vitest_1.expect)(onlyNumbers).toBe('');
        });
    });
    (0, vitest_1.describe)('normalizeString', () => {
        (0, vitest_1.test)('should return only day and month', () => {
            const onlyNumbers = _1.default.normalizeString('12/12');
            (0, vitest_1.expect)(onlyNumbers).toBe('12/12');
        });
        (0, vitest_1.test)('should return day, month and year', () => {
            const onlyNumbers = _1.default.normalizeString('12/12/2020');
            (0, vitest_1.expect)(onlyNumbers).toBe('12/12/2020');
        });
        (0, vitest_1.test)('should return values with two digits', () => {
            const onlyNumbers = _1.default.normalizeString('2/5/2020');
            (0, vitest_1.expect)(onlyNumbers).toBe('02/05/2020');
        });
        (0, vitest_1.test)('should replace partial small year', () => {
            const onlyNumbers = _1.default.normalizeString('12/12/20');
            (0, vitest_1.expect)(onlyNumbers).toBe('12/12/2020');
        });
        (0, vitest_1.test)('should replace partial big year', () => {
            const onlyNumbers = _1.default.normalizeString('31/3/44');
            (0, vitest_1.expect)(onlyNumbers).toBe('31/03/1944');
        });
        (0, vitest_1.test)('should return no letters', () => {
            const onlyNumbers = _1.default.normalizeString('12b/1f2/2020a');
            (0, vitest_1.expect)(onlyNumbers).toBe('12/12/2020');
        });
        (0, vitest_1.test)('should return empty string', () => {
            const onlyNumbers = _1.default.normalizeString('');
            (0, vitest_1.expect)(onlyNumbers).toBe('');
        });
    });
    (0, vitest_1.describe)('normalizeYear', () => {
        (0, vitest_1.test)('should return empty string', () => {
            const onlyNumbers = _1.default.normalizeYear('');
            (0, vitest_1.expect)(onlyNumbers).toBe('');
        });
        (0, vitest_1.test)('should return year with 4 digits', () => {
            const onlyNumbers = _1.default.normalizeYear('2020');
            (0, vitest_1.expect)(onlyNumbers).toBe('2020');
        });
        (0, vitest_1.test)('should return year with 4 digits', () => {
            const onlyNumbers = _1.default.normalizeYear('20');
            (0, vitest_1.expect)(onlyNumbers).toBe('2020');
        });
        (0, vitest_1.test)('should return year with 4 digits', () => {
            const onlyNumbers = _1.default.normalizeYear('2');
            (0, vitest_1.expect)(onlyNumbers).toBe('2002');
        });
        (0, vitest_1.test)('should return year with 4 digits', () => {
            const onlyNumbers = _1.default.normalizeYear('44');
            (0, vitest_1.expect)(onlyNumbers).toBe('1944');
        });
        (0, vitest_1.test)('should return throw error', () => {
            (0, vitest_1.expect)(() => _1.default.normalizeYear('203')).toThrow('Invalid year 203');
        });
        (0, vitest_1.test)('should return throw error', () => {
            (0, vitest_1.expect)(() => _1.default.normalizeYear('4444')).toThrow('Invalid year 4444');
        });
        (0, vitest_1.test)('should return throw error', () => {
            (0, vitest_1.expect)(() => _1.default.normalizeYear('44444')).toThrow('Invalid year 44444');
        });
        (0, vitest_1.test)('should return throw error', () => {
            (0, vitest_1.expect)(() => _1.default.normalizeYear('1899')).toThrow('Invalid year 1899');
        });
    });
    (0, vitest_1.describe)('normalizeDayOrMonth', () => {
        (0, vitest_1.test)('should return empty string', () => {
            (0, vitest_1.expect)(() => _1.default.normalizeDayOrMonth('')).toThrow('Invalid date');
        });
        (0, vitest_1.test)('should return day or month with 2 digits', () => {
            const onlyNumbers = _1.default.normalizeDayOrMonth('1');
            (0, vitest_1.expect)(onlyNumbers).toBe('01');
        });
        (0, vitest_1.test)('should return day or month with 2 digits', () => {
            const onlyNumbers = _1.default.normalizeDayOrMonth('12');
            (0, vitest_1.expect)(onlyNumbers).toBe('12');
        });
        (0, vitest_1.test)('should return throw error', () => {
            (0, vitest_1.expect)(() => _1.default.normalizeDayOrMonth('123')).toThrow('Invalid date 123');
        });
    });
});
//# sourceMappingURL=index.test.js.map