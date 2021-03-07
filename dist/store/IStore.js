"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IStore {
    constructor() {
        this.valueFunction = null;
        this.expire = 86400000;
        this.timeoutCallback = null;
        this.limit = null;
        this.valueType = null;
    }
    keyCode(key) {
        if (key == null) {
            return null;
        }
        else if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
            return key.toString();
        }
        else {
            return JSON.stringify(key);
        }
    }
}
exports.default = IStore;
//# sourceMappingURL=IStore.js.map