"use strict";
class IStore {
    constructor() {
        this.valueFunction = null;
        this.expire = 86400000;
        this.timeoutCallback = null;
        this.limit = null;
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
