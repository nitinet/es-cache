import * as types from './types/index.js';
import IStore from './store/IStore.js';

class Cache<K, V extends any> {
	private _store: IStore<K, V> = null;

	constructor(opts?: types.IOption<K, V>) {
		opts = opts || {};
		opts.storeType = opts.storeType || 'local';

		this.init(opts);
	}

	private async init(options: types.IOption<K, V>) {
		let module = null;
		switch (options.storeType) {
			case types.StoreType[types.StoreType.local]:
				module = await import('./store/Local.js');
				break;

			case types.StoreType[types.StoreType.redis]:
				module = await import('./store/Redis.js');
				break;

			case types.StoreType[types.StoreType.memcache]:
				module = await import('./store/Memcache.js');
				break;
		}

		this._store = new module.default(options.client, options.prefix);

		this._store.valueFunction = options.valueFunction || null;
		this._store.expire = options.expire || null;
		this._store.timeoutCallback = options.timeoutCallback || null;
		this._store.limit = options.limit || null;
		this._store.valueType = options.valueType || null;
	}

	async get(key: K): Promise<V> {
		return this._store.get(key);
	}

	async put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean> {
		return this._store.put(key, val, expire, timeoutCallback);
	}

	async del(key: K): Promise<boolean> {
		return this._store.del(key);
	}

	clear(): void {
		this._store.clear();
	}

	async size(): Promise<number> {
		return this._store.size();
	}

	async keys(): Promise<K[]> {
		return this._store.keys();
	}

	async forEach(func: (val: V, key: K, that: this) => Promise<void>) {
		let that = this;
		let keys = await this.keys();

		keys.forEach(async (key) => {
			let val: V = await this.get(key);
			await func(val, key, that);
		});
	}

}

export { Cache };
