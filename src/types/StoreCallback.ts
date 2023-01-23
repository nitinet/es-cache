interface StoreCallback<K, V> {
	(key: K, ...opts: any[]): Promise<V>;
}

export default StoreCallback;
