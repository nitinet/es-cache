import * as redis from 'redis';
import { IOption } from '../types.js';
import IStore from './IStore.js';

export default class Redis<K, V> extends IStore<K, V> {
  private prefix: string;
  private keyPrefix: string;
  private client: redis.RedisClientType;

  constructor(opts: IOption<K, V>) {
    super(opts.valueFunction, opts.ttl, opts.limit, opts.transformer);
    this.client = opts.client;
    this.prefix = opts.prefix ?? 'cache' + (Math.random() * 1000).toFixed(0);
    this.keyPrefix = this.prefix + '-keys';
  }

  protected keyCode(key: K): string {
    const keyCode = super.keyCode(key);
    return this.prefix + keyCode;
  }

  async get(key: K): Promise<V | null> {
    const jsonStr = await this.client.get(this.keyCode(key));

    let result: V | null = null;
    if (jsonStr) {
      result = this.JsonParse(jsonStr);
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
    const jsonStrs = await this.client.mGet(keyCodes);
    const res = await Promise.all(
      jsonStrs.map(async (jsonStr, i) => {
        let result: V | null = null;
        if (jsonStr) {
          result = this.JsonParse(jsonStr);
        } else if (this.valueFunction) {
          const key = keys[i];
          try {
            result = await this.valueFunction(key);
            if (result != null) this.put(key, result, this.ttl);
          } catch (err) {
            console.log(err);
          }
        }
        return result;
      })
    );
    return res;
  }

  async put(key: K, val: V, ttl?: number): Promise<boolean> {
    try {
      if (val == null) {
        throw new Error('Value cannot be a null');
      }

      if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
        throw new Error('timeout is not a number or less then 0');
      }

      const objJson = this.JsonStringify(val);

      await this.client.set(this.keyCode(key), objJson);
      ttl = ttl ?? this.ttl;
      if (ttl) this.client.expire(this.keyCode(key), ttl / 1000);

      // Removing Overlimit element
      await this.client.lPush(this.keyPrefix, super.keyCode(key));

      if (this.limit) {
        const keys = await this.keys();
        while (this.limit < keys.length) {
          const firstKey = await this.client.lPop(this.keyPrefix);
          this.client.del(this.prefix + firstKey);
        }
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async del(key: K): Promise<boolean> {
    if (!key) {
      return false;
    }
    await this.client.lRem(this.keyPrefix, 0, super.keyCode(key));
    const result = await this.client.del(this.keyCode(key));
    return !!result;
  }

  async clear(): Promise<void> {
    const keys = await this.keys();
    for (const key of keys) {
      this.del(key);
    }
  }

  async size(): Promise<number> {
    const res = await this.client.lLen(this.keyPrefix);
    return res;
  }

  async keys(): Promise<K[]> {
    const keys = await this.client.lRange(this.keyPrefix, 0, -1);
    return keys as K[];
  }
}
