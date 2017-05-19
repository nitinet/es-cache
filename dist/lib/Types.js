"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
class IStore {
    constructor() {
        this.valueFunction = null;
        this.expire = 86400000;
        this.timeoutCallback = null;
        this.limit = null;
    }
    keyCode(key) {
        if (key == null) {
            return null;
        }
        else if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
            return key.toString();
        }
        else {
            let hash = crypto.createHash('sha256');
            hash.update(JSON.stringify(key));
            return hash.digest('latin1');
        }
    }
}
exports.IStore = IStore;
class StoreValue {
    constructor() {
        this.key = null;
        this.value = null;
        this.valueFunc = null;
        this.expire = null;
        this.timeout = null;
        this.timeoutCallback = null;
    }
}
exports.StoreValue = StoreValue;
