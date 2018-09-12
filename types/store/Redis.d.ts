import * as redis from 'redis';
import IStore from './IStore';
import * as types from '../types';
export default class Redis<K, V> extends IStore<K, V> {
    host: string;
    port: number;
    prefix: string;
    client: redis.RedisClient;
    constructor(option: redis.ClientOpts);
    get(key: K): Promise<V>;
    put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean>;
    del(key: K): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    keys(): Promise<Array<K>>;
}
