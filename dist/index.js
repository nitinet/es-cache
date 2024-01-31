import * as types from './types/index.js';
class Cache {
    opts;
    _store;
    constructor(opts) {
        this.opts = opts ?? {};
        this.opts.storeType = this.opts.storeType ?? 'local';
        this.init(this.opts);
    }
    async init(options) {
        let module;
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
            default:
                module = await import('./store/Local.js');
        }
        this._store = new module.default(options.client, options.prefix);
        this._store.valueFunction = options.valueFunction ?? null;
        this._store.ttl = options.ttl ?? 86400000;
        this._store.limit = options.limit ?? null;
        this._store.valueType = options.valueType ?? null;
        if (this._store.valueType)
            this._store.transformer = await import('class-transformer');
    }
    async get(key) {
        return this._store.get(key);
    }
    async getOrThrow(key) {
        let val = await this.get(key);
        if (!val)
            throw new EvalError(this.opts.errorMsg ?? 'Value Not Found');
        return val;
    }
    async gets(keys) {
        return this._store.gets(keys);
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
        await Promise.all(keys.map(async (key) => {
            let val = await this.get(key);
            if (val)
                await func(val, key, that);
        }));
    }
}
export default Cache;
//# sourceMappingURL=index.js.map