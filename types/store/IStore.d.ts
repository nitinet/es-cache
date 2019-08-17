import StoreCallback from '../types/StoreCallback';
declare abstract class IStore<K, V> {
    valueFunction: StoreCallback<K, V>;
    expire: number;
    timeoutCallback: StoreCallback<K, V>;
    limit: () => Promise<Boolean>;
    constructor();
    protected keyCode(key: K): string;
    abstract get(key: K): Promise<V>;
    abstract put(key: K, val: V, expire?: number, timeoutCallback?: StoreCallback<K, V>): Promise<boolean>;
    abstract del(key: K): Promise<boolean>;
    abstract clear(): void;
    abstract size(): Promise<number>;
    abstract keys(): Promise<Array<K>>;
}
export default IStore;
