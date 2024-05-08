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
const server_js_1 = __importDefault(require("../modules/connector/server.js"));
const client_js_1 = __importDefault(require("../modules/connector/client.js"));
const delay_js_1 = __importDefault(require("../modules/delay.js"));
(0, vitest_1.describe)('socketServer', () => {
    (0, vitest_1.test)('Inicialização', () => {
        (0, vitest_1.expect)(true).toBe(true);
    });
    (0, vitest_1.describe)('createServer', () => {
        (0, vitest_1.test)('Métodos', () => {
            (0, vitest_1.expect)(server_js_1.default.getSocketServer).toBeDefined();
            (0, vitest_1.expect)(server_js_1.default.createServer).toBeDefined();
        });
        (0, vitest_1.test)('createServer', () => __awaiter(void 0, void 0, void 0, function* () {
            const server = yield server_js_1.default.createServer({ port: 3001 });
            (0, vitest_1.expect)(server).toBeDefined();
            (0, vitest_1.expect)(server).toHaveProperty('on');
            (0, vitest_1.expect)(server).toHaveProperty('emit');
            server.close();
        }));
    });
    function createServerForTests(...events) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = yield server_js_1.default.createServer({ port: 3001 });
            (0, vitest_1.expect)(server.engine.clientsCount).toBe(0);
            const messages = [];
            events.forEach(event => server.on(event, (...args) => messages.push({ event, args })));
            return { server, messages };
        });
    }
    (0, vitest_1.describe)('createClient', () => {
        (0, vitest_1.test)('Conecta a um socket', () => __awaiter(void 0, void 0, void 0, function* () {
            const { server, messages } = yield createServerForTests('connection');
            const client = client_js_1.default.createClient({ url: `http://localhost:3001` });
            yield client.waitConnection();
            (0, vitest_1.expect)(messages.length).toBe(1);
            const [message] = messages;
            (0, vitest_1.expect)(message.event).toBe('connection');
            (0, vitest_1.expect)(message.args.length).toBe(1);
            const [socket] = message.args;
            (0, vitest_1.expect)(socket).toBeDefined();
            (0, vitest_1.expect)(socket.id).toBeDefined();
            socket.disconnect();
            server.close();
        }));
    });
    (0, vitest_1.describe)('request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, vitest_1.test)('Sem metodos', () => __awaiter(void 0, void 0, void 0, function* () {
            const { server } = yield createServerForTests('message');
            const methods = {};
            const client = client_js_1.default.createClient({ url: `http://localhost:3001`, methods });
            yield client.waitConnection();
            const targetName = 'client';
            const call = 'test';
            const payload = { test: true };
            try {
                const result = yield client.request(targetName, call, payload);
                (0, vitest_1.expect)(result).toBeUndefined();
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeDefined();
                (0, vitest_1.expect)(error.message).toBe('Method not found test');
            }
            server.close();
            client.disconnect();
        }));
        (0, vitest_1.test)('Com metodos', () => __awaiter(void 0, void 0, void 0, function* () {
            const { server } = yield createServerForTests('message');
            const methods = { test: (payload) => __awaiter(void 0, void 0, void 0, function* () { return (Object.assign(Object.assign({}, payload), { test2: true })); }) };
            const client = client_js_1.default.createClient({ url: `http://localhost:3001`, methods });
            yield client.waitConnection();
            const targetName = 'client';
            const call = 'test';
            const payload = { test: true };
            const result = yield client.request(targetName, call, payload);
            (0, vitest_1.expect)(result).toBeDefined();
            (0, vitest_1.expect)(result).toHaveProperty('test', true);
            (0, vitest_1.expect)(result).toHaveProperty('test2', true);
            server.close();
            client.disconnect();
        }));
    }));
    (0, vitest_1.describe)('Cenários', () => {
        (0, vitest_1.test)('3 clientes', () => __awaiter(void 0, void 0, void 0, function* () {
            const { server } = yield createServerForTests('message');
            function multiplication(...args) {
                return args.reduce((acc, value) => acc * value, 1);
            }
            function sum(...args) {
                return args.reduce((acc, value) => acc + value, 0);
            }
            const methods = { multiplication, sum };
            const serverUrl = `http://localhost:3001`;
            const client1 = client_js_1.default.createClient({ url: serverUrl, methods, name: 'client1' });
            const client2 = client_js_1.default.createClient({ url: serverUrl, methods, name: 'client2' });
            const client3 = client_js_1.default.createClient({ url: serverUrl, methods, name: 'client3' });
            const clients = [client1, client2, client3];
            yield Promise.all(clients.map(client => client.waitConnection()));
            yield Promise.all(clients.map((client) => __awaiter(void 0, void 0, void 0, function* () {
                for (let index = 0; index < 3; index++) {
                    const targetName = `client${index + 1}`;
                    const result1 = yield client.request(targetName, 'multiplication', 2, 3, 4);
                    (0, vitest_1.expect)(result1).toBe(24);
                    const result2 = yield client.request(targetName, 'sum', 2, 3, 4);
                    (0, vitest_1.expect)(result2).toBe(9);
                }
            })));
            client1.disconnect();
            client2.disconnect();
            client3.disconnect();
            server.close();
        }));
        (0, vitest_1.test)('Nomes iguais', () => __awaiter(void 0, void 0, void 0, function* () {
            const { server } = yield createServerForTests('message');
            const onDuplicated = vitest_1.vi.fn();
            const serverUrl = `http://localhost:3001`;
            const client1 = client_js_1.default.createClient({ url: serverUrl, name: 'client', onDuplicated });
            const client2 = client_js_1.default.createClient({ url: serverUrl, name: 'client', onDuplicated });
            const client3 = client_js_1.default.createClient({ url: serverUrl, name: 'client', onDuplicated });
            const clients = [client1, client2, client3];
            yield Promise.all(clients.map(client => client.waitConnection()));
            (0, vitest_1.expect)(onDuplicated).toHaveBeenCalledTimes(2);
            client1.disconnect();
            client2.disconnect();
            client3.disconnect();
            server.close();
        }));
        (0, vitest_1.test)('Desconexão', () => __awaiter(void 0, void 0, void 0, function* () {
            const { server } = yield createServerForTests('message');
            const serverUrl = `http://localhost:3001`;
            const client1 = client_js_1.default.createClient({ url: serverUrl });
            const client2 = client_js_1.default.createClient({ url: serverUrl });
            const client3 = client_js_1.default.createClient({ url: serverUrl });
            const clients = [client1, client2, client3];
            yield Promise.all(clients.map(client => client.waitConnection()));
            yield (0, delay_js_1.default)(200);
            (0, vitest_1.expect)(client1.isConnected()).toBe(true);
            (0, vitest_1.expect)(client2.isConnected()).toBe(false);
            (0, vitest_1.expect)(client3.isConnected()).toBe(false);
            client1.disconnect();
            server.close();
        }));
    });
});
//# sourceMappingURL=connector.test.js.map