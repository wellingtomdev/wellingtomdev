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
const createQueue_js_1 = __importDefault(require("../modules/createQueue.js"));
(0, vitest_1.describe)('createQueue', () => {
    (0, vitest_1.test)('Deve retornar um objeto contendo os métodos', () => {
        const queue = (0, createQueue_js_1.default)();
        (0, vitest_1.expect)(typeof queue).toBe('object');
        (0, vitest_1.expect)(typeof queue.getStarted).toBe('function');
        (0, vitest_1.expect)(typeof queue.add).toBe('function');
        (0, vitest_1.expect)(typeof queue.run).toBe('function');
        (0, vitest_1.expect)(typeof queue.start).toBe('function');
        (0, vitest_1.expect)(typeof queue.stop).toBe('function');
    });
    (0, vitest_1.describe)('Método getStarted', () => {
        (0, vitest_1.test)('Deve retornar o valor padrão de state.started', () => {
            const queue = (0, createQueue_js_1.default)();
            (0, vitest_1.expect)(queue.getStarted()).toBe(true);
        });
        (0, vitest_1.test)('Deve retornar false', () => {
            const queue = (0, createQueue_js_1.default)({ initStarted: false });
            (0, vitest_1.expect)(queue.getStarted()).toBe(false);
        });
        (0, vitest_1.test)('Deve retornar true', () => {
            const queue = (0, createQueue_js_1.default)({ initStarted: true });
            (0, vitest_1.expect)(queue.getStarted()).toBe(true);
        });
    });
    (0, vitest_1.describe)('Método start', () => {
        (0, vitest_1.test)('Deve iniciar a execução da fila', () => {
            const queue = (0, createQueue_js_1.default)({ initStarted: false });
            queue.start();
            (0, vitest_1.expect)(queue.getStarted()).toBe(true);
        });
    });
    (0, vitest_1.describe)('Método stop', () => {
        (0, vitest_1.test)('Deve parar a execução da fila', () => {
            const queue = (0, createQueue_js_1.default)();
            queue.stop();
            (0, vitest_1.expect)(queue.getStarted()).toBe(false);
        });
    });
    (0, vitest_1.describe)('Método add', () => {
        (0, vitest_1.test)('Deve adicionar um callback na fila', () => __awaiter(void 0, void 0, void 0, function* () {
            const queue = (0, createQueue_js_1.default)();
            const callback = vitest_1.vi.fn();
            const task = queue.add(callback);
            (0, vitest_1.expect)(task.id).toBeDefined();
            (0, vitest_1.expect)(typeof task.promise).toBe('object');
            (0, vitest_1.expect)(typeof task.promise.then).toBe('function');
            yield task.promise;
            (0, vitest_1.expect)(callback).toHaveBeenCalled();
            (0, vitest_1.expect)(callback).toHaveBeenCalledTimes(1);
        }));
        (0, vitest_1.test)('Deve adicionar um callback que retorna uma Promise na fila', () => __awaiter(void 0, void 0, void 0, function* () {
            const queue = (0, createQueue_js_1.default)();
            const callback = () => Promise.resolve('ok');
            const task = queue.add(callback);
            const result = yield task.promise;
            (0, vitest_1.expect)(result).toBe('ok');
        }));
        (0, vitest_1.test)('Deve adicionar um callback que é rejeitado na fila', () => __awaiter(void 0, void 0, void 0, function* () {
            const queue = (0, createQueue_js_1.default)();
            const callback = () => { throw new Error('Erro ao executar callback'); };
            const task = queue.add(callback);
            try {
                yield task.promise;
                (0, vitest_1.expect)(true).toBe(false);
            }
            catch (error) {
                (0, vitest_1.expect)(error.message).toBe('Erro ao executar callback');
            }
        }));
        (0, vitest_1.test)('Deve adicionar um callback que retorna uma Promise que é rejeitada na fila', () => __awaiter(void 0, void 0, void 0, function* () {
            const queue = (0, createQueue_js_1.default)();
            const callback = () => Promise.reject(new Error('Erro ao executar callback'));
            const task = queue.add(callback);
            try {
                yield task.promise;
                (0, vitest_1.expect)(true).toBe(false);
            }
            catch (error) {
                (0, vitest_1.expect)(error.message).toBe('Erro ao executar callback');
            }
        }));
    });
    (0, vitest_1.describe)('Método get', () => {
        (0, vitest_1.test)('Deve retornar uma task da fila', () => __awaiter(void 0, void 0, void 0, function* () {
            const queue = (0, createQueue_js_1.default)();
            const callback = vitest_1.vi.fn();
            const task = queue.add(callback);
            (0, vitest_1.expect)(queue.get(task.id)).toBeDefined();
        }));
        (0, vitest_1.test)('Deve retornar undefined para uma task que não existe na fila', () => {
            const queue = (0, createQueue_js_1.default)();
            const task = queue.get('task-id');
            (0, vitest_1.expect)(task).toBeUndefined();
        });
        (0, vitest_1.test)('Deve retornar undefined para uma task que já foi executada', () => __awaiter(void 0, void 0, void 0, function* () {
            const queue = (0, createQueue_js_1.default)();
            const callback = vitest_1.vi.fn();
            const task = queue.add(callback);
            (0, vitest_1.expect)(queue.get(task.id)).toBeDefined();
            yield task.promise;
            (0, vitest_1.expect)(callback).toHaveBeenCalled();
            (0, vitest_1.expect)(queue.get(task.id)).toBeUndefined();
        }));
    });
    (0, vitest_1.describe)('Método remove', () => {
        (0, vitest_1.test)('Deve remover um callback da fila', () => __awaiter(void 0, void 0, void 0, function* () {
            const queue = (0, createQueue_js_1.default)({ initStarted: false });
            const callback = vitest_1.vi.fn();
            const task = queue.add(callback);
            (0, vitest_1.expect)(queue.get(task.id)).toBeDefined();
            const result = queue.remove(task.id);
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(queue.get(task.id)).toBeUndefined();
        }));
        (0, vitest_1.test)('Deve remover um callback que não existe na fila', () => {
            const queue = (0, createQueue_js_1.default)();
            const result = queue.remove('task-id');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
});
//# sourceMappingURL=createQueue.test.js.map