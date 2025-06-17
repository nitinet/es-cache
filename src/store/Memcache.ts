import memcached from 'memcached';
import { IOption } from '../types.js';
import IStore from './IStore.js';

export default class Memcache<K, V> extends IStore<K, V> {
  private client: memcached;
  private prefix: string;

  constructor(opts: IOption<K, V>) {
    super(opts.valueFunction, opts.ttl, opts.limit, opts.transformer);
    this.client = opts.client;
    this.prefix = opts.prefix ?? 'cache' + (Math.random() * 1000).toFixed(0);
  }

  protected keyCode(key: K): string {
    const keyCode = super.keyCode(key);
    return this.prefix + keyCode;
  }

  async get(key: K): Promise<V | null> {
    const json = await new Promise<string>((res, rej) => {
      this.client.get(this.keyCode(key), (err: Error, data: string) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });
    let result: V | null = null;
    if (json) {
      result = this.JsonParse(json);
    }
    if (result == null && this.valueFunction) {
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
    const keyCodes = keys.map(k => this.keyCode(k));
    const jsonStrs = await new Promise<{ [key: string]: string | null }>((res, rej) => {
      this.client.getMulti(keyCodes, (err: Error, data: { [key: string]: string | null }) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });
    const res = await Promise.all(
      keys.map(async (k, i) => {
        const json = jsonStrs[this.keyCode(k)];
        if (json) {
          return this.JsonParse(json);
        } else if (this.valueFunction) {
          const key = keys[i];
          try {
            const temp = await this.valueFunction(key);
            if (temp != null) this.put(key, temp, this.ttl);
            return temp;
          } catch (err) {
            console.log(err);
          }
          return null;
        } else return null;
      })
    );
    return res;
  }

  async put(key: K, val: V, ttl?: number): Promise<boolean> {
    try {
      if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
        throw new Error('timeout is not a number or less then 0');
      }

      if (val == null) {
        throw new Error('Value cannot be a null');
      }

      const objJson = this.JsonStringify(val);

      return await new Promise<boolean>((res, rej) => {
        this.client.set(this.keyCode(key), objJson, this.ttl / 1000, (err: Error, data: boolean) => {
          if (err) {
            rej(err);
          } else {
            res(data);
          }
        });
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async del(key: K): Promise<boolean> {
    if (!key) {
      return false;
    }
    const hashKey = this.keyCode(key);
    return new Promise<boolean>((res, rej) => {
      return this.client.del(hashKey, (err: Error, data: boolean) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });
  }

  async clear(): Promise<void> {}

  async size(): Promise<number> {
    return 0;
  }

  async keys(): Promise<K[]> {
    return [];
  }
}
