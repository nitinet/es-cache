class StoreValue<K, V> {
	key: any;
	value: any;
	ttl: number;

	constructor(key: any, value: any, ttl: number) {
		this.key = key;
		this.value = value;
		this.ttl = ttl;
	}
}

export default StoreValue;
