"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = __importDefault(require("./index"));
(0, vitest_1.describe)('getObjectId', () => {
    (0, vitest_1.describe)('string vazia', () => {
        (0, vitest_1.test)('deve retornar uma string vazia', () => {
            const result = (0, index_1.default)();
            (0, vitest_1.expect)(result).toBe('');
        });
        (0, vitest_1.test)('deve retornar uma string vazia', () => {
            const result = (0, index_1.default)({});
            (0, vitest_1.expect)(result).toBe('');
        });
    });
    (0, vitest_1.describe)('valores simples', () => {
        (0, vitest_1.test)('deve retornar exatamente os valores de a e b', () => {
            const result = (0, index_1.default)({ a: 1, b: 2 });
            (0, vitest_1.expect)(result).toBe('1-2');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ a: 1, b: 2, c: 3 });
            (0, vitest_1.expect)(result).toBe('1-2-3');
        });
    });
    (0, vitest_1.describe)('fora de ordem', () => {
        (0, vitest_1.test)('deve retornar exatamente os valores de a e b', () => {
            const result = (0, index_1.default)({ b: 2, a: 1 });
            (0, vitest_1.expect)(result).toBe('1-2');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ b: 2, a: 1, c: 3 });
            (0, vitest_1.expect)(result).toBe('1-2-3');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ c: 3, a: 1, b: 2 });
            (0, vitest_1.expect)(result).toBe('1-2-3');
        });
    });
    (0, vitest_1.describe)('valores aninhados', () => {
        (0, vitest_1.test)('deve retornar exatamente os valores de a e b', () => {
            const result = (0, index_1.default)({ a: 1, b: { c: 2 } });
            (0, vitest_1.expect)(result).toBe('1-2');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ a: 1, b: { c: 2 }, d: 3 });
            (0, vitest_1.expect)(result).toBe('1-2-3');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ a: 1, b: { c: 2, d: 3 } });
            (0, vitest_1.expect)(result).toBe('1-2-3');
        });
    });
    (0, vitest_1.describe)('valores duplamente aninhados', () => {
        (0, vitest_1.test)('deve retornar exatamente os valores de a e b', () => {
            const result = (0, index_1.default)({ a: 1, b: { c: 2, d: { e: 3 } } });
            (0, vitest_1.expect)(result).toBe('1-2-3');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ a: 1, b: { c: 2, d: { e: 3 }, f: 4 } });
            (0, vitest_1.expect)(result).toBe('1-2-3-4');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ a: 1, b: { c: 2, d: { e: 3, f: 4 } } });
            (0, vitest_1.expect)(result).toBe('1-2-3-4');
        });
    });
    (0, vitest_1.describe)('valores com arrays', () => {
        (0, vitest_1.test)('deve retornar exatamente os valores de a e b', () => {
            const result = (0, index_1.default)({ a: 1, b: [2, 3] });
            (0, vitest_1.expect)(result).toBe('1-2-3');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ a: 1, b: [2, 3], c: 4 });
            (0, vitest_1.expect)(result).toBe('1-2-3-4');
        });
        (0, vitest_1.test)('deve retornar exatamente os valores de a, b e c', () => {
            const result = (0, index_1.default)({ a: 1, b: [2, 3, 4] });
            (0, vitest_1.expect)(result).toBe('1-2-3-4');
        });
    });
});
//# sourceMappingURL=index.test.js.map