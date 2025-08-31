import IStore from './store/IStore.js';
import { IOption } from './types.js';

class Cache<K, V> {
  opts: IOption<K, V>;
  private _store!: IStore<K, V>;

  constructor(opts?: IOption<K, V>) {
    this.opts = opts ?? {};
    this.opts.storeType = this.opts.storeType ?? 'local';

    this.init();
  }

  public async init() {
    let module;
    switch (this.opts.storeType) {
      case 'local':
        module = await import('./store/Local.js');
        break;

      case 'redis':
        module = await import('./store/Redis.js');
        break;

      case 'memcache':
        module = await import('./store/Memcache.js');
        break;
      default:
        module = await import('./store/Local.js');
    }

    this._store = new module.default(this.opts);

    this._store.valueFunction = this.opts.valueFunction ?? null;
    this._store.transformer = this.opts.transformer ?? null;
  }

  async get(key: K): Promise<V | null> {
    return this._store.get(key);
  }

  async getOrThrow(key: K): Promise<NonNullable<V>> {
    let val = await this.get(key);
    if (val === null || val === undefined) throw new EvalError(`Value Not Found for key: ${key}`);
    return val;
  }

  async gets(keys: K[]): Promise<(V | null)[]> {
    return this._store.gets(keys);
  }

  async put(key: K, val: V, ttl?: number): Promise<boolean> {
    return this._store.put(key, val, ttl);
  }

  async del(key: K): Promise<boolean> {
    return this._store.del(key);
  }

  clear(): void {
    this._store.clear();
  }

  async size(): Promise<number> {
    return this._store.size();
  }

  async keys(): Promise<K[]> {
    return this._store.keys();
  }

  async forEach(func: (val: V, key: K, that: this) => Promise<void>) {
    let that = this;
    let keys = await this.keys();

    await Promise.all(
      keys.map(async key => {
        let val = await this.get(key);
        if (val) await func(val, key, that);
      })
    );
  }
}

const cache = async <K, V>(opts?: IOption<K, V>) => {
  const cacheInstance = new Cache<K, V>(opts);
  await cacheInstance.init();

  return cacheInstance;
};

export default cache;

export { IOption, Cache };
