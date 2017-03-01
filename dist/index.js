"use strict";
const LocalStore_1 = require("./lib/LocalStore");
const RedisStore_1 = require("./lib/RedisStore");
class Cache {
    constructor(options) {
        this._store = null;
        if (options) {
            if (options.store) {
                switch (options.store.type) {
                    case 'redis': {
                        this._store = new RedisStore_1.default(options.store);
                        break;
                    }
                    default:
                        this._store = new LocalStore_1.default();
                        break;
                }
            }
            else {
                this._store = new LocalStore_1.default();
            }
            this._store.valueFunction = options.valueFunction ? options.valueFunction : null;
            this._store.expire = options.expire ? options.expire : null;
            this._store.timeoutCallback = options.timeoutCallback ? options.timeoutCallback : null;
            this._store.limit = options.limit ? options.limit : null;
        }
        else {
            this._store = new LocalStore_1.default();
        }
    }
    async get(key) {
        return this._store.get(key);
    }
    async put(key, val, expire, timeoutCallback) {
        return this._store.put(key, val, expire, timeoutCallback);
    }
    async del(key) {
        return await this._store.del(key);
    }
    clear() {
        this._store.clear();
    }
    async size() {
        return this._store.size();
    }
    keys() {
        return this._store.keys();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cache;
