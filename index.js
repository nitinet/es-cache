"use strict";
class StoreValue {
    constructor() {
    }
}
class Cache {
    constructor(valueFunc, expire) {
        this._store = new Map();
        this.expire = 86400000;
        this.valueFunc = valueFunc ? valueFunc : null;
        this.expire = expire ? expire : this.expire;
    }
    get(key) {
        let s = this._store.get(key.toString());
        let result = null;
        if (s) {
            result = s.value ? s.value : s.valueFunc(s.key);
        }
        if (!result && this.valueFunc) {
            result = this.valueFunc(key);
            this.put(key, result, this.expire);
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
            rec.expire = expire;
            if (val && typeof val === 'function') {
                rec.valueFunc = val;
                rec.value = rec.valueFunc(rec.key);
            }
            else {
                rec.value = val;
            }
            if (rec.expire && !isNaN(rec.expire)) {
                let that = this;
                rec.timeout = setTimeout(function () {
                    rec.value = null;
                    if (timeoutCallback) {
                        timeoutCallback(key);
                    }
                }, rec.expire);
            }
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
