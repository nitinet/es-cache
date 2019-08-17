import * as types from './types';
import * as store from './store';

class Cache<K, V extends any> {
  private _store: store.IStore<K, V> = null;

  constructor(options?: types.IOption<K, V>) {
    options = options || {};
    options.storeType = options.storeType || 'local';

    switch (options.storeType) {
      case types.StoreType[types.StoreType.local]:
        this._store = new store.Local<K, V>();
        break;

      case types.StoreType[types.StoreType.redis]:
        this._store = new store.Redis<K, V>(options.storeConfig);
        break;

      case types.StoreType[types.StoreType.memcache]:
        this._store = new store.Memcache<K, V>(options.storeConfig);
        break;

      default:
        this._store = new store.Local<K, V>();
        break;
    }

    this._store.valueFunction = options.valueFunction ? options.valueFunction : null;
    this._store.expire = options.expire ? options.expire : null;
    this._store.timeoutCallback = options.timeoutCallback ? options.timeoutCallback : null;
    this._store.limit = options.limit ? options.limit : null;
  }

  async get(key: K): Promise<V> {
    return this._store.get(key);
  }

  async put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean> {
    return this._store.put(key, val, expire, timeoutCallback);
  }

  async del(key: K): Promise<boolean> {
    return await this._store.del(key);
  }

  clear(): void {
    this._store.clear();
  }

  async size(): Promise<number> {
    return this._store.size();
  }

  async keys(): Promise<Array<K>> {
    return this._store.keys();
  }

  async forEach(func: (key: K, that: this) => Promise<void>): Promise<void> {
    let that = this;
    let keys = await this.keys();
    keys.forEach(async (val) => {
      await func(val, that);
    });
  }

}

export { Cache };
