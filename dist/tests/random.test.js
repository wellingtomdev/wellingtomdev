"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const random_js_1 = __importDefault(require("../modules/random.js"));
(0, vitest_1.describe)('random', () => {
    (0, vitest_1.describe)('random.string', () => {
        (0, vitest_1.describe)('length', () => {
            (0, vitest_1.test)('length padrão', () => {
                (0, vitest_1.expect)(random_js_1.default.string().length).toEqual(10);
            });
            (0, vitest_1.test)('length 5', () => {
                (0, vitest_1.expect)(random_js_1.default.string(5).length).toEqual(5);
            });
            (0, vitest_1.test)('length 15', () => {
                (0, vitest_1.expect)(random_js_1.default.string(15).length).toEqual(15);
            });
        });
        (0, vitest_1.describe)('chars', () => {
            (0, vitest_1.test)('chars padrão', () => {
                const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const result = random_js_1.default.string(100);
                const invalidChars = result.split('').filter(char => !chars.includes(char));
                (0, vitest_1.expect)(invalidChars).toEqual([]);
            });
            (0, vitest_1.test)('chars 01', () => {
                const chars = '01';
                const result = random_js_1.default.string(100, chars);
                const invalidChars = result.split('').filter(char => !chars.includes(char));
                (0, vitest_1.expect)(invalidChars).toEqual([]);
            });
            (0, vitest_1.test)('chars 123', () => {
                const chars = '123';
                const result = random_js_1.default.string(100, chars);
                const invalidChars = result.split('').filter(char => !chars.includes(char));
                (0, vitest_1.expect)(invalidChars).toEqual([]);
            });
        });
        (0, vitest_1.describe)('randomness', () => {
            (0, vitest_1.test)('randomness', () => {
                const result1 = random_js_1.default.string(100);
                const result2 = random_js_1.default.string(100);
                (0, vitest_1.expect)(result1).not.toEqual(result2);
            });
            (0, vitest_1.test)('randomness 2', () => {
                const result1 = random_js_1.default.string(100, '01');
                const result2 = random_js_1.default.string(100, '01');
                (0, vitest_1.expect)(result1).not.toEqual(result2);
            });
        });
        (0, vitest_1.describe)('performance', () => {
            (0, vitest_1.test)('performance', () => {
                const start = Date.now();
                random_js_1.default.string(100000);
                const end = Date.now();
                (0, vitest_1.expect)(end - start).toBeLessThan(30);
            });
        });
    });
});
//# sourceMappingURL=random.test.js.map