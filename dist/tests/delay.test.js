"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const delay_js_1 = __importDefault(require("../modules/delay.js"));
(0, vitest_1.describe)('delay', () => {
    (0, vitest_1.test)('Deve retornar uma Promise', () => {
        const result = (0, delay_js_1.default)(1000);
        (0, vitest_1.expect)(result instanceof Promise).toBe(true);
    });
    (0, vitest_1.test)('Deve resolver a Promise após o tempo especificado', () => __awaiter(void 0, void 0, void 0, function* () {
        const start = Date.now();
        yield (0, delay_js_1.default)(100);
        const end = Date.now();
        (0, vitest_1.expect)(end - start).toBeGreaterThanOrEqual(100);
    }));
});
//# sourceMappingURL=delay.test.js.map