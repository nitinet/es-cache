import StoreCallback from './StoreCallback';

class StoreValue<K, V> {
	key: any = null;
	value: any = null;
	valueFunc: StoreCallback<K, V> = null;
	expire: number = null;
	timeout: NodeJS.Timer = null;
	timeoutCallback: StoreCallback<K, V> = null;
}

export default StoreValue;
