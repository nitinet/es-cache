"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Types = require("./Types");
class LocalStore extends Types.IStore {
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
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let s = this._store.get(key.toString());
            let result = null;
            if (s) {
                if (s.value == null && s.valueFunc) {
                    s.value = yield s.valueFunc(s.key);
                    this.setupExpire(s);
                }
                result = s.value;
            }
            if (result == null && this.valueFunction) {
                result = yield this.valueFunction(key);
                this.put(key, result, this.expire, this.timeoutCallback);
            }
            return result;
        });
    }
    put(key, val, expire, timeoutCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (expire && !(typeof expire == 'number' || !isNaN(expire) || expire <= 0)) {
                    throw new Error("timeout is not a number or less then 0");
                }
                if (timeoutCallback && typeof timeoutCallback !== 'function') {
                    throw new Error('Cache timeout callback must be a function');
                }
                let rec = new Types.StoreValue();
                rec.key = key;
                if (val && typeof val === 'function') {
                    rec.valueFunc = val;
                    rec.value = yield rec.valueFunc(rec.key);
                }
                else {
                    rec.value = val;
                }
                rec.expire = expire;
                rec.timeoutCallback = timeoutCallback;
                this.setupExpire(rec);
                this._store.set(key.toString(), rec);
                let keysLength = this._keys.push(key.toString());
                if (this.limit && keysLength > this.limit) {
                    let firstKey = this._keys.shift();
                    this.del(firstKey);
                }
                return rec.value;
            }
            catch (error) {
                console.log(error);
                return null;
            }
        });
    }
    del(key) {
        if (key) {
            key = key.toString();
        }
        else {
            return false;
        }
        let keyIndex = this._keys.indexOf(key);
        if (keyIndex != -1) {
            this._keys.splice(keyIndex, 1);
        }
        let val = this._store.get(key);
        if (val) {
            if (val.timeout) {
                clearTimeout(val.timeout);
            }
            this._store.delete(key.toString());
            return true;
        }
        return false;
    }
    clear() {
        for (let key of this._keys) {
            this.del(key);
        }
    }
    size() {
        return this._keys.length;
    }
    keys() {
        return this._keys;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LocalStore;
