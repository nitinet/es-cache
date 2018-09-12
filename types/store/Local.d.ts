import IStore from './IStore';
import * as types from '../types';
export default class Local<K, V> extends IStore<K, V> {
    _store: Map<string, types.StoreValue<K, V>>;
    _keys: Array<K>;
    constructor();
    private setupExpire;
    get(key: K): Promise<V>;
    put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean>;
    del(key: K): Promise<boolean>;
    clear(): void;
    size(): Promise<number>;
    keys(): Promise<Array<K>>;
}
