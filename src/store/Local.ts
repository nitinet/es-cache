import { IOption } from '../types.js';
import IStore from './IStore.js';

class StoreValue<K, V> {
  key: K;
  value: V;
  timeout: NodeJS.Timeout | undefined;

  constructor(key: K, value: V, timeout?: NodeJS.Timeout) {
    this.key = key;
    this.value = value;
    this.timeout = timeout;
  }
}

export default class Local<K, V> extends IStore<K, V> {
  _store: Map<string, StoreValue<K, V>> = new Map<string, StoreValue<K, V>>();
  _keys: Array<K> = new Array<K>();

  constructor(opts: IOption<K, V>) {
    super(opts.valueFunction, opts.ttl, opts.limit, opts.transformer);
  }

  private setupExpire(key: K, expireTime: number) {
    if (expireTime && expireTime > 0) {
      return setTimeout(() => {
        this.del(key);
      }, expireTime);
    }
  }

  async get(key: K): Promise<V | null> {
    const s = this._store.get(this.keyCode(key));
    let result: V | null = null;
    if (s) {
      result = s.value;
    } else if (this.valueFunction) {
      try {
        result = await this.valueFunction(key);
        if (result != null) {
          this.put(key, result, this.ttl);
        }
      } catch (err) {
        console.log(err);
      }
    }
    return result;
  }

  async gets(keys: K[]): Promise<(V | null)[]> {
    return await Promise.all(keys.map(key => this.get(key)));
  }

  async put(key: K, val: V, ttl?: number): Promise<boolean> {
    try {
      if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
        throw new Error('timeout is not a number or less then 0');
      }

      if (val == null) {
        throw new Error('Value cannot be a null');
      }

      const expireTime = ttl ?? this.ttl;
      const timeout = this.setupExpire(key, expireTime);

      const rec: StoreValue<K, V> = new StoreValue(key, val, timeout);
      this._store.set(this.keyCode(key), rec);

      // Removing Overlimit elements
      this._keys.push(key);
      if (this.limit) {
        while (this.limit < this._keys.length) {
          const firstKey = this._keys.shift();
          if (firstKey) this.del(firstKey);
        }
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async del(key: K): Promise<boolean> {
    if (!key) {
      return false;
    }
    const keyIndex = this._keys.indexOf(key);
    if (keyIndex != -1) {
      this._keys.splice(keyIndex, 1);
    }

    const val = this._store.get(this.keyCode(key));
    if (val) {
      this._store.delete(this.keyCode(key));
      if (val.timeout) {
        clearTimeout(val.timeout);
      }

      return true;
    }

    return false;
  }

  clear(): void {
    for (const key of this._keys) {
      this.del(key);
    }
  }

  async size(): Promise<number> {
    return this._keys.length;
  }

  async keys(): Promise<Array<K>> {
    return this._keys;
  }
}
