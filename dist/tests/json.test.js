"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const json_js_1 = __importDefault(require("../modules/json.js"));
(0, vitest_1.describe)('json', () => {
    (0, vitest_1.test)('parse', () => {
        const result = json_js_1.default.parse('{"name":"John"}');
        (0, vitest_1.expect)(result).toEqual({ name: 'John' });
    });
    (0, vitest_1.test)('parse com erro', () => {
        const result = json_js_1.default.parse('{"name":"John}');
        (0, vitest_1.expect)(result).toEqual('{"name":"John}');
    });
    (0, vitest_1.test)('parse com erro e throwNull', () => {
        const result = json_js_1.default.parse('{"name":"John}', true);
        (0, vitest_1.expect)(result).toEqual(null);
    });
    (0, vitest_1.test)('stringify', () => {
        const result = json_js_1.default.stringify({ name: 'John' });
        (0, vitest_1.expect)(result).toEqual('{"name":"John"}');
    });
    (0, vitest_1.test)('stringify com erro', () => {
        const result = json_js_1.default.stringify({ name: 'John', toJSON: () => { throw new Error(); } });
        (0, vitest_1.expect)(result).toEqual(undefined);
    });
    (0, vitest_1.test)('stringify com string', () => {
        const result = json_js_1.default.stringify('{"name":"John"}');
        (0, vitest_1.expect)(result).toEqual('{"name":"John"}');
    });
    (0, vitest_1.test)('stringify com erro na string', () => {
        const result = json_js_1.default.stringify('{"name":"John}');
        (0, vitest_1.expect)(result).toEqual('{"name":"John}');
    });
});
//# sourceMappingURL=json.test.js.map