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
const { io } = require('socket.io-client');
const random = require('../random');
const delay = require('../delay');
const defaultEventName = 'message';
const defaultEventResponse = 'response';
const defaultEventProcedure = 'procedure';
function createClient({ url = "http://localhost:3000", name = "client", methods = {}, onError = error => error, onDuplicated = error => error, }) {
    const state = { url };
    const socket = io(url);
    socket.on('setup', (requires) => __awaiter(this, void 0, void 0, function* () {
        const payload = {};
        if (requires.includes('name'))
            payload.name = name;
        if (requires.includes('methods'))
            payload.methods = Object.keys(methods);
        try {
            const response = yield request('server', 'setup', payload);
            if (response.name)
                state.name = response.name;
            if (response.methods)
                state.methods = response.methods;
        }
        catch (error) {
            state.name = 'duplicated';
            if (error === 'Connection already exists')
                return onDuplicated(error);
            return onError(error);
        }
    }));
    socket.on(defaultEventResponse, onResponse);
    socket.on(defaultEventProcedure, onProcedure);
    function getSocket() { return socket; }
    function isConnected() {
        if (!state.name)
            return false;
        return socket.connected;
    }
    function waitConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (isConnected())
                return true;
            yield delay(100);
            return waitConnection();
        });
    }
    function disconnect() { socket.disconnect(); }
    const requests = {};
    function createId() {
        const id = random.string();
        if (requests[id])
            return createId();
        return id;
    }
    function emit(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return socket.emit(defaultEventName, ...args);
        });
    }
    function request(targetName, call, ...args) {
        const id = createId();
        const promise = new Promise((resolve, reject) => requests[id] = { resolve, reject });
        emit({ id, targetName, call, args });
        return promise;
    }
    function onProcedure() {
        return __awaiter(this, arguments, void 0, function* ({ id, originId, call, args } = {}) {
            try {
                const method = methods[call];
                if (!method)
                    throw new Error(`Method ${call} not found`);
                const response = yield method(...args);
                emit({ id, originId, response, success: true, error: undefined });
            }
            catch (error) {
                emit({ id, originId, response: undefined, success: false, error });
            }
        });
    }
    function onResponse({ id, response, success, error } = {}) {
        try {
            if (!requests[id])
                return;
            const { resolve, reject } = requests[id];
            success ? resolve(response) : reject(error);
            delete requests[id];
        }
        catch (error) {
            console.error(error);
        }
    }
    return {
        emit,
        state,
        request,
        getSocket,
        isConnected,
        waitConnection,
        disconnect,
    };
}
module.exports = {
    createClient,
};
//# sourceMappingURL=client.js.map