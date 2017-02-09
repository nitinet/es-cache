import * as Types from './lib/Types';
import LocalStore from './lib/LocalStore';
import RedisStore from './lib/RedisStore';

export default class Cache {
  private _store: Types.IStore = null;

  constructor(options?: Types.IOption) {
    if (options) {
      switch (options.store.type) {
        case 'redis': {
          this._store = new RedisStore(options.store);
          break;
        }

        default:
          this._store = new LocalStore();
          break;
      }

      this._store.valueFunction = options.valueFunction ? options.valueFunction : null;
      this._store.expire = options.expire ? options.expire : null;
      this._store.timeoutCallback = options.timeoutCallback ? options.timeoutCallback : null;
      this._store.limit = options.limit ? options.limit : null;
    } else {
      this._store = new LocalStore();
    }
  }

  async get(key: (string | number | symbol)): Promise<any> {
    return this._store.get(key);
  }

  async put(key: (string | number | symbol), val: any, expire?: number, timeoutCallback?: Types.StoreCallback): Promise<boolean> {
    return this._store.put(key, val, expire, timeoutCallback);
  }

  del(key: (string | number | symbol)): boolean {
    return this._store.del(key);
  }

  clear(): void {
    this._store.clear();
  }

  size(): number {
    return this._store.size();
  }

  keys(): Array<any> {
    return this._store.keys();
  }

}
