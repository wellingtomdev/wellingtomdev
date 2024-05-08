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
const getAvailablePort_js_1 = __importDefault(require("../modules/getAvailablePort.js"));
const http_1 = require("http");
function _createServer(port) {
    return new Promise(resolve => {
        const server = (0, http_1.createServer)((req, res) => res.end());
        server.listen(port, () => resolve(server));
    });
}
(0, vitest_1.describe)('getAvailablePort', () => {
    (0, vitest_1.test)('Deve retornar um número', () => __awaiter(void 0, void 0, void 0, function* () {
        const port = yield (0, getAvailablePort_js_1.default)();
        (0, vitest_1.expect)(typeof port).toBe('number');
    }));
    (0, vitest_1.test)('Deve retornar o valor padrão 3000', () => __awaiter(void 0, void 0, void 0, function* () {
        const port = yield (0, getAvailablePort_js_1.default)();
        (0, vitest_1.expect)(port).toBe(3000);
    }));
    (0, vitest_1.test)('Deve retornar um número entre 1000 e 1100', () => __awaiter(void 0, void 0, void 0, function* () {
        const port = yield (0, getAvailablePort_js_1.default)(1000);
        (0, vitest_1.expect)(port).toBeGreaterThanOrEqual(1000);
        (0, vitest_1.expect)(port).toBeLessThanOrEqual(1100);
    }));
    (0, vitest_1.test)('Deve retornar um número que não está em uso', () => __awaiter(void 0, void 0, void 0, function* () {
        const available = yield (0, getAvailablePort_js_1.default)();
        const server = yield _createServer(available);
        try {
            const newPort = yield (0, getAvailablePort_js_1.default)(available);
            (0, vitest_1.expect)(newPort).not.toBe(available);
            (0, vitest_1.expect)(newPort).toBe(available + 1);
        }
        catch (error) {
            throw error;
        }
        finally {
            server.close();
        }
    }));
});
//# sourceMappingURL=getAvailablePort.test.js.map