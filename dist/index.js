import * as types from './types/index.js';
class Cache {
    _store = null;
    constructor(opts) {
        opts = opts || {};
        opts.storeType = opts.storeType || 'local';
        this.init(opts);
    }
    async init(options) {
        let module = null;
        switch (options.storeType) {
            case types.StoreType[types.StoreType.local]:
                module = await import('./store/Local.js');
                break;
            case types.StoreType[types.StoreType.redis]:
                module = await import('./store/Redis.js');
                break;
            case types.StoreType[types.StoreType.memcache]:
                module = await import('./store/Memcache.js');
                break;
        }
        this._store = new module.default(options.client, options.prefix);
        this._store.valueFunction = options.valueFunction || null;
        this._store.ttl = options.ttl || null;
        this._store.limit = options.limit || null;
        this._store.valueType = options.valueType || null;
    }
    async get(key) {
        return this._store.get(key);
    }
    async put(key, val, ttl) {
        return this._store.put(key, val, ttl);
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
export default Cache;
//# sourceMappingURL=index.js.map