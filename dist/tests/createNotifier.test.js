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
const createNotifier_js_1 = __importDefault(require("../modules/createNotifier.js"));
(0, vitest_1.describe)('createNotifier', () => {
    (0, vitest_1.describe)('exists', () => {
        (0, vitest_1.test)('Deve retornar false se o listener não existir', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const result = notifier.exists('id');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.test)('Deve retornar true se o listener existir', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const id = notifier.subscribe();
            const result = notifier.exists(id);
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('subscribe', () => {
        (0, vitest_1.test)('Deve retornar um id', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const id = notifier.subscribe();
            (0, vitest_1.expect)(typeof id).toBe('string');
        });
        (0, vitest_1.test)('Deve retornar um id diferente a cada chamada', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const id1 = notifier.subscribe();
            const id2 = notifier.subscribe();
            (0, vitest_1.expect)(id1).not.toBe(id2);
        });
        (0, vitest_1.test)('Deve lançar um erro se o listener não for uma função', () => {
            const notifier = (0, createNotifier_js_1.default)();
            (0, vitest_1.expect)(() => notifier.subscribe('string')).toThrow();
        });
        (0, vitest_1.test)('Deve permitir a subscrição de um listener', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const listener = () => { };
            notifier.subscribe(listener);
            (0, vitest_1.expect)(notifier.count()).toBe(1);
        });
        (0, vitest_1.test)('Deve permitir a subscrição de vários listeners', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const listener = () => { };
            notifier.subscribe(listener);
            notifier.subscribe(listener);
            (0, vitest_1.expect)(notifier.count()).toBe(2);
        });
        (0, vitest_1.test)('Deve permitir a subscrição de vários listeners diferentes', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const listener1 = () => { };
            const listener2 = () => { };
            notifier.subscribe(listener1);
            notifier.subscribe(listener2);
            (0, vitest_1.expect)(notifier.count()).toBe(2);
        });
    });
    (0, vitest_1.describe)('notify', () => {
        (0, vitest_1.test)('Deve retornar um erro se o listener não existir', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const notifier = (0, createNotifier_js_1.default)();
                yield notifier.notify('id', 'data');
                (0, vitest_1.expect)(true).toBe(false);
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeInstanceOf(Error);
                (0, vitest_1.expect)(error.message).toBe('Listener not found');
            }
        }));
        (0, vitest_1.test)('Deve retornar o valor retornado pelo listener', () => __awaiter(void 0, void 0, void 0, function* () {
            const notifier = (0, createNotifier_js_1.default)();
            const listener = (data) => `Hello ${data}`;
            const id = notifier.subscribe(listener);
            const result = yield notifier.notify(id, 'data');
            (0, vitest_1.expect)(result).toBe('Hello data');
        }));
        (0, vitest_1.test)('Deve retornar o listenerId', () => __awaiter(void 0, void 0, void 0, function* () {
            const notifier = (0, createNotifier_js_1.default)();
            const listener = (data, listenerId) => listenerId;
            const id = notifier.subscribe(listener);
            const result = yield notifier.notify(id, 'data');
            (0, vitest_1.expect)(result).toBe(id);
        }));
        (0, vitest_1.test)('Deve retornar undefined se o listener lançar um erro', () => __awaiter(void 0, void 0, void 0, function* () {
            const notifier = (0, createNotifier_js_1.default)();
            const listener = () => { throw new Error(); };
            const id = notifier.subscribe(listener);
            const result = yield notifier.notify(id, 'data', true);
            (0, vitest_1.expect)(result).toBe(undefined);
        }));
    });
    (0, vitest_1.describe)('notifyAll', () => {
        (0, vitest_1.test)('Deve chamar o método notify para cada listener', () => {
            const notifier = (0, createNotifier_js_1.default)();
            let counter = 0;
            const listener = () => counter++;
            notifier.subscribe(listener);
            notifier.subscribe(listener);
            notifier.notifyAll();
            (0, vitest_1.expect)(counter).toBe(2);
        });
        (0, vitest_1.test)('Deve retornar true', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const result = notifier.notifyAll();
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.test)('Deve retornar true mesmo com o listener lançando um erro', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const listener = () => { throw new Error(); };
            notifier.subscribe(listener);
            const result = notifier.notifyAll();
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('unsubscribe', () => {
        (0, vitest_1.test)('Deve retornar um erro se o listener não existir', () => {
            try {
                const notifier = (0, createNotifier_js_1.default)();
                notifier.unsubscribe('id');
                (0, vitest_1.expect)(true).toBe(false);
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeInstanceOf(Error);
                (0, vitest_1.expect)(error.message).toBe('Listener not found');
            }
        });
        (0, vitest_1.test)('Deve retornar true se o listener for removido', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const id = notifier.subscribe();
            const result = notifier.unsubscribe(id);
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.test)('Deve remover o listener', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const id = notifier.subscribe();
            notifier.unsubscribe(id);
            (0, vitest_1.expect)(notifier.count()).toBe(0);
        });
        (0, vitest_1.test)('Deve remover o listener correto', () => {
            const notifier = (0, createNotifier_js_1.default)();
            const id1 = notifier.subscribe();
            const id2 = notifier.subscribe();
            notifier.unsubscribe(id1);
            (0, vitest_1.expect)(notifier.count()).toBe(1);
            (0, vitest_1.expect)(notifier.exists(id1)).toBe(false);
            (0, vitest_1.expect)(notifier.exists(id2)).toBe(true);
        });
    });
    (0, vitest_1.describe)('unsubscribeAll', () => {
        (0, vitest_1.test)('Deve remover todos os listeners', () => {
            const notifier = (0, createNotifier_js_1.default)();
            notifier.subscribe();
            notifier.subscribe();
            notifier.unsubscribeAll();
            (0, vitest_1.expect)(notifier.count()).toBe(0);
        });
    });
    (0, vitest_1.describe)('count', () => {
        (0, vitest_1.test)('Deve retornar a quantidade de listeners (0)', () => {
            const notifier = (0, createNotifier_js_1.default)();
            (0, vitest_1.expect)(notifier.count()).toBe(0);
        });
        (0, vitest_1.test)('Deve retornar a quantidade de listeners (2)', () => {
            const notifier = (0, createNotifier_js_1.default)();
            notifier.subscribe();
            notifier.subscribe();
            (0, vitest_1.expect)(notifier.count()).toBe(2);
        });
    });
});
//# sourceMappingURL=createNotifier.test.js.map