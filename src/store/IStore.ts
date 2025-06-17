import { StoreCallback } from '../types.js';

abstract class IStore<K, V> {
  valueFunction: StoreCallback<K, V> | null = null;
  ttl: number;
  limit: number | null;

  transformer: ((data: string) => V) | null;

  constructor(valueFunction?: StoreCallback<K, V>, ttl: number = 0, limit?: number, transformer?: (data: string) => V) {
    this.valueFunction = valueFunction ?? null;
    this.ttl = ttl;
    this.limit = limit ?? null;
    this.transformer = transformer ?? null;
  }

  protected keyCode(key: K): string {
    if (key == null) {
      throw new Error('Invalid Key');
    } else if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
      return key.toString();
    } else {
      return JSON.stringify(key);
    }
  }

  protected JsonParse(data: string) {
    const obj = JSON.parse(data, (key, value) => {
      if (typeof value === 'string' && /^\d+n$/.test(value)) {
        return BigInt(value.substring(0, value.length - 1));
      } else {
        return value;
      }
    });

    const res: V = this.transformer ? this.transformer(obj) : obj;
    return res;
  }

  protected JsonStringify(val: unknown): string {
    const res = JSON.stringify(val, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n';
      } else {
        return value;
      }
    });
    return res;
  }

  abstract get(key: K): Promise<V | null>;
  abstract gets(keys: K[]): Promise<(V | null)[]>;
  abstract put(key: K, val: V, ttl?: number): Promise<boolean>;
  abstract del(key: K): Promise<boolean>;
  abstract clear(): void;
  abstract size(): Promise<number>;
  abstract keys(): Promise<K[]>;
}

export default IStore;
