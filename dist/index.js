"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const types = require("./types");
const store = require("./store");
class Cache {
    constructor(options) {
        this._store = null;
        options = options || {};
        options.storeType = options.storeType || 'local';
        switch (options.storeType) {
            case types.StoreType[types.StoreType.local]:
                this._store = new store.Local();
                break;
            case types.StoreType[types.StoreType.redis]:
                this._store = new store.Redis(options.storeConfig);
                break;
            case types.StoreType[types.StoreType.memcache]:
                this._store = new store.Memcache(options.storeConfig);
                break;
            default:
                this._store = new store.Local();
                break;
        }
        this._store.valueFunction = options.valueFunction || null;
        this._store.expire = options.expire || null;
        this._store.timeoutCallback = options.timeoutCallback || null;
        this._store.limit = options.limit || null;
        this._store.valueType = options.valueType || null;
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
    async keys() {
        return this._store.keys();
    }
    async forEach(func) {
        let that = this;
        let keys = await this.keys();
        keys.forEach(async (val) => {
            await func(val, that);
        });
    }
}
exports.Cache = Cache;
//# sourceMappingURL=index.js.map