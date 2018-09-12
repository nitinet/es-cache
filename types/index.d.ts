import * as types from './types';
declare class Cache<K, V extends any> {
    private _store;
    constructor(options?: types.IOption<K, V>);
    get(key: K): Promise<V>;
    put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean>;
    del(key: K): Promise<boolean>;
    clear(): void;
    size(): Promise<number>;
    keys(): Promise<Array<K>>;
    forEach(func: (key: K, that: this) => Promise<void>): Promise<void>;
}
export { Cache };
