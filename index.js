"use strict";
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
class Cache {
    constructor(valueFunc, expire, timeoutCallback) {
        this._store = new Map();
        this.valueFunc = null;
        this.expire = 86400000;
        this.timeoutCallback = null;
        this.valueFunc = valueFunc ? valueFunc : null;
        this.expire = expire ? expire : this.expire;
        this.timeoutCallback = timeoutCallback ? timeoutCallback : null;
    }
    setupExpire(store) {
        if (store.expire && !isNaN(store.expire)) {
            store.timeout = setTimeout(function () {
                store.value = null;
                if (store.timeoutCallback) {
                    store.timeoutCallback(store.key);
                }
            }, store.expire);
        }
    }
    get(key) {
        let s = this._store.get(key.toString());
        let result = null;
        if (s) {
            if (s.value == null && s.valueFunc) {
                s.value = s.valueFunc(s.key);
                this.setupExpire(s);
            }
            result = s.value;
        }
        if (result == null && this.valueFunc) {
            result = this.valueFunc(key);
            this.put(key, result, this.expire, this.timeoutCallback);
        }
        return result;
    }
    put(key, val, expire, timeoutCallback) {
        try {
            if (typeof expire !== 'undefined' && (typeof expire !== 'number' || isNaN(expire) || expire <= 0)) {
                throw new Error("timeout is not a number or less then 0");
            }
            if (timeoutCallback && typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
                throw new Error('Cache timeout callback must be a function');
            }
            let rec = new StoreValue();
            rec.key = key;
            if (val && typeof val === 'function') {
                rec.valueFunc = val;
                rec.value = rec.valueFunc(rec.key);
            }
            else {
                rec.value = val;
            }
            rec.expire = expire;
            rec.timeoutCallback = timeoutCallback;
            this.setupExpire(rec);
            this._store.set(key.toString(), rec);
            return rec.value;
        }
        catch (Error) {
            return null;
        }
    }
    del(key) {
        if (key) {
            key = key.toString();
        }
        else {
            return false;
        }
        let rec = this._store.get(key);
        if (rec) {
            clearTimeout(rec.timeout);
            this._store.delete(key.toString());
            return true;
        }
        return false;
    }
    clear() {
        for (let val of this._store.values()) {
            clearTimeout(val.timeout);
        }
        this._store.clear();
    }
    size() {
        return this._store.size;
    }
    keys() {
        let res = new Array();
        for (let key of this._store.keys()) {
            res.push(key);
        }
        return res;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cache;
