interface StoreCallback<K, V> {
	(key?: K, ...opts): Promise<V>;
}

export default StoreCallback;
