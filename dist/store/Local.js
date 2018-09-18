"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IStore_1 = require("./IStore");
const types = require("../types");
class Local extends IStore_1.default {
    constructor() {
        super();
        this._store = new Map();
        this._keys = new Array();
    }
    setupExpire(store) {
        let that = this;
        if (store.expire) {
            store.timeout = setTimeout(function () {
                store.value = null;
                if (store.timeoutCallback) {
                    store.timeoutCallback(store.key);
                }
                if (!store.valueFunc) {
                    that.del(store.key);
                }
            }, store.expire);
        }
    }
    async get(key) {
        let s = this._store.get(this.keyCode(key));
        let result = null;
        if (s) {
            if (s.value == null && s.valueFunc) {
                s.value = await s.valueFunc(s.key);
                this.setupExpire(s);
            }
            result = s.value;
        }
        if (result == null && this.valueFunction) {
            result = await this.valueFunction(key);
            if (result == null) {
                this.put(key, result, this.expire, this.timeoutCallback);
            }
        }
        return result;
    }
    async put(key, val, expire, timeoutCallback) {
        try {
            if (expire && !(typeof expire == 'number' || !isNaN(expire) || expire <= 0)) {
                throw new Error("timeout is not a number or less then 0");
            }
            if (timeoutCallback && typeof timeoutCallback !== 'function') {
                throw new Error('Cache timeout callback must be a function');
            }
            if (val == null) {
                throw new Error('Value cannot be a null');
            }
            let rec = new types.StoreValue();
            rec.key = key;
            rec.value = val;
            rec.expire = expire;
            rec.timeoutCallback = timeoutCallback;
            this.setupExpire(rec);
            this._store.set(this.keyCode(key), rec);
            this._keys.push(key);
            if (this.limit && typeof this.limit == 'function') {
                while (await this.limit()) {
                    let firstKey = this._keys.shift();
                    this.del(firstKey);
                }
            }
            return rec.value;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async del(key) {
        if (!key) {
            return false;
        }
        let keyIndex = this._keys.indexOf(key);
        if (keyIndex != -1) {
            this._keys.splice(keyIndex, 1);
        }
        let val = this._store.get(this.keyCode(key));
        if (val) {
            if (val.timeout) {
                clearTimeout(val.timeout);
            }
            this._store.delete(this.keyCode(key));
            return true;
        }
        return false;
    }
    clear() {
        for (let key of this._keys) {
            this.del(key);
        }
    }
    async size() {
        return this._keys.length;
    }
    async keys() {
        return this._keys;
    }
}
exports.default = Local;
