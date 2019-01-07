import IStore from './IStore';
import * as types from '../types';
export default class Redis<K, V> extends IStore<K, V> {
    private prefix;
    private client;
    constructor(option: any);
    get(key: K): Promise<V>;
    put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean>;
    del(key: K): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    keys(): Promise<Array<K>>;
}
