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
const axios = require('axios');
function checkPortAvailability(port) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield axios.get(`http://localhost:${port}`)
            .then(() => false)
            .catch((err) => {
            if (err.code === 'ECONNREFUSED')
                return true;
            return false;
        });
    });
}
function getAvailablePort() {
    return __awaiter(this, arguments, void 0, function* (initPort = 3000, limit = 100) {
        let testPort = initPort;
        while (testPort < initPort + limit) {
            const available = yield checkPortAvailability(testPort);
            if (available)
                return testPort;
            testPort++;
        }
    });
}
module.exports = getAvailablePort;
//# sourceMappingURL=getAvailablePort.js.map