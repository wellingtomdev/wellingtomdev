"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_js_1 = __importDefault(require("./index.js"));
(0, vitest_1.describe)('normalizedNumber', () => {
    (0, vitest_1.test)('Completo', () => {
        const length_8 = (0, index_js_1.default)('552299999999');
        (0, vitest_1.expect)(length_8).toEqual('552299999999');
        const length_9 = (0, index_js_1.default)('5522999999999');
        (0, vitest_1.expect)(length_9).toEqual('5522999999999');
    });
    (0, vitest_1.test)('sem o 55', () => {
        const length_8 = (0, index_js_1.default)('2299999999');
        (0, vitest_1.expect)(length_8).toEqual('552299999999');
        const length_9 = (0, index_js_1.default)('22999999999');
        (0, vitest_1.expect)(length_9).toEqual('5522999999999');
    });
    (0, vitest_1.test)('com prefíxo 015', () => {
        const length_8 = (0, index_js_1.default)('0152299999999');
        (0, vitest_1.expect)(length_8).toEqual('552299999999');
        const length_9 = (0, index_js_1.default)('01522999999999');
        (0, vitest_1.expect)(length_9).toEqual('5522999999999');
    });
    (0, vitest_1.test)('com prefíxo 15', () => {
        const length_8 = (0, index_js_1.default)('152299999999');
        (0, vitest_1.expect)(length_8).toEqual('552299999999');
        const length_9 = (0, index_js_1.default)('1522999999999');
        (0, vitest_1.expect)(length_9).toEqual('5522999999999');
    });
    (0, vitest_1.test)('Contato do exterior', () => {
        const length_8 = (0, index_js_1.default)('+542299999999');
        (0, vitest_1.expect)(length_8).toEqual('542299999999');
        const length_9 = (0, index_js_1.default)('+5422999999999');
        (0, vitest_1.expect)(length_9).toEqual('5422999999999');
    });
    (0, vitest_1.test)('Contato do exterior sem validação de números', () => {
        const result = (0, index_js_1.default)('+1 (214) 241-9271', false);
        (0, vitest_1.expect)(result).toEqual('12142419271');
    });
    (0, vitest_1.test)('Com DDD 15', () => {
        const length_8 = (0, index_js_1.default)('551599999999');
        (0, vitest_1.expect)(length_8).toEqual('551599999999');
        const length_9 = (0, index_js_1.default)('5515999999999');
        (0, vitest_1.expect)(length_9).toEqual('5515999999999');
    });
    (0, vitest_1.test)('Com DDD 15 e sem o 55', () => {
        const length_8 = (0, index_js_1.default)('1599999999');
        (0, vitest_1.expect)(length_8).toEqual('551599999999');
        const length_9 = (0, index_js_1.default)('15999999999');
        (0, vitest_1.expect)(length_9).toEqual('5515999999999');
    });
});
//# sourceMappingURL=index.test.js.map