"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const sortVersions_js_1 = __importDefault(require("../modules/sortVersions.js"));
(0, vitest_1.describe)('sortVersions', () => {
    (0, vitest_1.test)('one version', () => {
        const versions = ['1'];
        (0, vitest_1.expect)((0, sortVersions_js_1.default)(versions)).toEqual(['1']);
    });
    (0, vitest_1.test)('two versions', () => {
        const versions = ['1.0', '2.0'];
        (0, vitest_1.expect)((0, sortVersions_js_1.default)(versions)).toEqual(['1.0', '2.0']);
    });
    (0, vitest_1.test)('inverted two versions', () => {
        const versions = ['2.0.0', '1.0'];
        (0, vitest_1.expect)((0, sortVersions_js_1.default)(versions)).toEqual(['1.0', '2.0.0']);
    });
    (0, vitest_1.test)('subversions', () => {
        const versions = ['1.0.1', '1.0.0'];
        (0, vitest_1.expect)((0, sortVersions_js_1.default)(versions)).toEqual(['1.0.0', '1.0.1']);
    });
    (0, vitest_1.test)('complex versions', () => {
        const versions = ['1.0.1', '1.0.0', '2.3.9', '2.3.10', '0.7.23', '0.7.22.1', '0.1', '1.4'];
        (0, vitest_1.expect)((0, sortVersions_js_1.default)(versions)).toEqual(['0.1', '0.7.22.1', '0.7.23', '1.0.0', '1.0.1', '1.4', '2.3.9', '2.3.10']);
    });
    (0, vitest_1.test)('array versions', () => {
        const versions = [
            { "version": "0.4.8" },
            { "version": "0.4.5" },
            { "version": "0.4.7" },
            { "version": "0.4.6" }
        ];
        (0, vitest_1.expect)((0, sortVersions_js_1.default)(versions)).toEqual([
            { "version": "0.4.5" },
            { "version": "0.4.6" },
            { "version": "0.4.7" },
            { "version": "0.4.8" }
        ]);
    });
    (0, vitest_1.test)('object versions', () => {
        const versions = {
            "0.4.8": { "version": "0.4.8" },
            "0.4.5": { "version": "0.4.5" },
            "0.4.7": { "version": "0.4.7" },
            "0.4.6": { "version": "0.4.6" }
        };
        (0, vitest_1.expect)((0, sortVersions_js_1.default)(versions)).toEqual([
            { "version": "0.4.5" },
            { "version": "0.4.6" },
            { "version": "0.4.7" },
            { "version": "0.4.8" }
        ]);
    });
});
//# sourceMappingURL=sortVersions.test.js.map