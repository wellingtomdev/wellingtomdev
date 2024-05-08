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
const { Server } = require("socket.io");
const http = require("http");
const connections = {};
function setup(originId, { name, methods } = {}) {
    const exists = getConnectionByName(name);
    const connection = getConnectionById(originId);
    if (exists) {
        setTimeout(() => connection.socket.disconnect(), 100);
        throw 'Connection already exists';
    }
    connection.config = { name, methods };
    return connection.config;
}
function internalExecution(name = 'internal', methods = {}) {
    function emit(event_1, _a) {
        return __awaiter(this, arguments, void 0, function* (event, { id, originId, call, args }) {
            try {
                const method = methods[call];
                const response = yield method(originId, ...args);
                onMessage(null, { id, originId, response, success: true, error: undefined });
            }
            catch (error) {
                onMessage(null, { id, originId, response: undefined, success: false, error });
            }
        });
    }
    return {
        socket: { emit },
        config: { name, methods: Object.keys(methods) }
    };
}
connections['server'] = internalExecution('server', { setup });
function onMessage(socket, request = {}) {
    function emitError(messageError = 'Error', id = undefined) {
        const error = { message: messageError };
        if (!id)
            throw error;
        return socket.emit('response', { id, response: undefined, success: false, error });
    }
    function callProcedure({ id, targetName, call, args } = {}) {
        var _a;
        const connection = getConnectionByName(targetName);
        if (!connection)
            return emitError('Connection not found', id);
        const methods = ((_a = connection.config) === null || _a === void 0 ? void 0 : _a.methods) || [];
        if (!methods.includes(call))
            return emitError('Method not found ' + call, id);
        const originId = socket.id;
        connection.socket.emit('procedure', { id, originId, call, args });
    }
    function callResponse({ id, originId, response, success, error } = {}) {
        const connection = getConnectionById(originId);
        if (!connection)
            return emitError('Connection not found');
        connection.socket.emit('response', { id, response, success, error });
    }
    const type = (request === null || request === void 0 ? void 0 : request.targetName) ? 'procedure' : 'response';
    if (type === 'procedure')
        return callProcedure(request);
    if (type === 'response')
        return callResponse(request);
    return emitError('Invalid request');
}
function onConnection(socket) {
    const id = socket.id;
    const connection = { id, socket, config: {}, };
    connections[id] = connection;
    socket.on("disconnect", () => delete connections[id]);
    socket.on("message", (...args) => onMessage(socket, ...args));
    socket.emit("setup", ['name', 'methods']);
    return socket;
}
function getSocketServer(httpServer, options = {}) {
    const io = new Server(httpServer, options);
    io.on("connection", onConnection);
    return io;
}
function createServer(port_1) {
    return __awaiter(this, arguments, void 0, function* (port, options = {}) {
        return new Promise((resolve) => {
            const httpServer = http.createServer();
            httpServer.listen(port, () => {
                const io = getSocketServer(httpServer, options);
                resolve(io);
            });
        });
    });
}
function getConnectionById(id) {
    return connections[id];
}
function getConnectionByName(name) {
    return Object.values(connections).find(connection => connection.config.name === name);
}
module.exports = {
    getSocketServer,
    createServer,
    getConnectionById,
};
//# sourceMappingURL=server.js.map