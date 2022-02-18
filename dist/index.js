import * as types from './types';
class Cache {
    constructor(opts) {
        this._store = null;
        opts = opts || {};
        opts.storeType = opts.storeType || 'local';
        this.init(opts);
    }
    async init(options) {
        let module = null;
        switch (options.storeType) {
            case types.StoreType[types.StoreType.local]:
                module = await import('./store/Local');
                break;
            case types.StoreType[types.StoreType.redis]:
                module = await import('./store/Redis');
                break;
            case types.StoreType[types.StoreType.memcache]:
                module = await import('./store/Memcache');
                break;
        }
        this._store = new module.default(options.storeConfig);
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
        return this._store.del(key);
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
        keys.forEach(async (key) => {
            let val = await this.get(key);
            await func(val, key, that);
        });
    }
}
export { Cache };
//# sourceMappingURL=index.js.map