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
const random = require('./random');
function createNotifier() {
    const subscribers = {};
    function exists(listenerId) {
        return subscribers[listenerId] !== undefined;
    }
    function subscribe(listener = () => { }) {
        if (typeof listener != 'function')
            throw new Error('Listener must be a function');
        const listenerId = random.string();
        if (exists(listenerId))
            return subscribe(listener);
        subscribers[listenerId] = { listenerId, listener };
        return listenerId;
    }
    function notify(listenerId_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (listenerId, data, safed = false) {
            if (!exists(listenerId))
                throw new Error('Listener not found');
            try {
                const { listener } = subscribers[listenerId];
                const result = listener(data, listenerId);
                if (result instanceof Promise)
                    return yield result;
                return result;
            }
            catch (error) {
                if (safed)
                    return undefined;
                throw error;
            }
        });
    }
    function notifyAll(data) {
        const subscribersIds = Object.keys(subscribers);
        subscribersIds.forEach(listenerId => notify(listenerId, data, true));
        return true;
    }
    function unsubscribe(listenerId) {
        if (!exists(listenerId))
            throw new Error('Listener not found');
        delete subscribers[listenerId];
        return true;
    }
    function unsubscribeAll() {
        const subscribersIds = Object.keys(subscribers);
        subscribersIds.forEach(listenerId => unsubscribe(listenerId));
        return true;
    }
    function count() {
        return Object.keys(subscribers).length;
    }
    return {
        count,
        notify,
        exists,
        notifyAll,
        subscribe,
        unsubscribe,
        unsubscribeAll,
    };
}
module.exports = createNotifier;
//# sourceMappingURL=createNotifier.js.map