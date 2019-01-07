import StoreCallback from './StoreCallback';
interface IOption<K, V> {
    valueFunction?: StoreCallback<K, V>;
    expire?: number;
    timeoutCallback?: StoreCallback<K, V>;
    limit?: () => Promise<Boolean>;
    storeType?: string;
    storeConfig?: any;
}
export default IOption;
