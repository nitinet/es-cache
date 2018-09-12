/// <reference types="node" />
import StoreCallback from './StoreCallback';
declare class StoreValue<K, V> {
    key: any;
    value: any;
    valueFunc: StoreCallback<K, V>;
    expire: number;
    timeout: NodeJS.Timer;
    timeoutCallback: StoreCallback<K, V>;
}
export default StoreValue;
