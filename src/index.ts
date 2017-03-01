import * as Types from './lib/Types';
import LocalStore from './lib/LocalStore';
import RedisStore from './lib/RedisStore';

export default class Cache<K, V> {
  private _store: Types.IStore<K, V> = null;

  constructor(options?: Types.IOption<K, V>) {
    if (options) {
      if (options.store) {
        switch (options.store.type) {
          case 'redis': {
            this._store = new RedisStore<K, V>(options.store);
            break;
          }
          default:
            this._store = new LocalStore<K, V>();
            break;
        }
      } else {
        this._store = new LocalStore<K, V>();
      }

      this._store.valueFunction = options.valueFunction ? options.valueFunction : null;
      this._store.expire = options.expire ? options.expire : null;
      this._store.timeoutCallback = options.timeoutCallback ? options.timeoutCallback : null;
      this._store.limit = options.limit ? options.limit : null;
    } else {
      this._store = new LocalStore<K, V>();
    }
  }

  async get(key: K): Promise<V> {
    return this._store.get(key);
  }

  async put(key: K, val: V, expire?: number, timeoutCallback?: Types.StoreCallback<K, V>): Promise<boolean> {
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

  keys(): Array<any> {
    return this._store.keys();
  }

}
