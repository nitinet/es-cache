"use strict";
class StoreValue {
    constructor() {
    }
    refresh() {
        if (!isNaN(this.expire)) {
            let x = this;
            this.timeout = setTimeout(function () {
                x.value = null;
                if (x.valueFunc) {
                    x.value = x.valueFunc(x.key);
                    x.refresh();
                }
            }, this.expire);
        }
    }
}
class Cache {
    constructor() {
        this._store = new Map();
    }
    get(key) {
        let s = this._store.get(key.toString());
        if (s) {
            return s.value;
        }
        return null;
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
            rec.key = key.toString();
            rec.expire = expire;
            if (val && typeof val === 'function') {
                rec.valueFunc = val;
                rec.value = rec.valueFunc(rec.key);
            }
            else {
                rec.value = val;
            }
            if (rec.expire && !isNaN(rec.expire)) {
                let x = this;
                if (rec.valueFunc) {
                    rec.refresh();
                }
                else {
                    rec.timeout = setTimeout(function () {
                        x.del(rec.key);
                        if (timeoutCallback) {
                            timeoutCallback(key);
                        }
                    }, rec.expire);
                }
            }
            this._store.set(key.toString(), rec);
            return rec.value;
        }
        catch (Error) {
            return null;
        }
    }
    del(key) {
        let rec = this._store.get(key.toString());
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
