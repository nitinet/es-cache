import * as types from './types';
import IStore from './store/IStore';

class Cache<K, V extends any> {
	private _store: IStore<K, V> = null;

	constructor(options?: types.IOption<K, V>) {
		options = options || {};
		options.storeType = options.storeType || 'local';

		this.init(options);
	}

	private async init(options: types.IOption<K, V>) {
		let module = null;
		switch (options.storeType) {
			case types.StoreType[types.StoreType.local]:
				module = await import('./store/Local');
				break;

			case types.StoreType[types.StoreType.redis]:
				module = await import('./store/Redis');
				break;

			case types.StoreType[types.StoreType.memcache]:
				module = await import('./store/Memcache');
				break;
		}

		this._store = new module.default();

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
		return await this._store.del(key);
	}

	clear(): void {
		this._store.clear();
	}

	async size(): Promise<number> {
		return this._store.size();
	}

	async keys(): Promise<Array<K>> {
		return this._store.keys();
	}

	async forEach(func: (key: K, that: this) => Promise<void>): Promise<void> {
		let that = this;
		let keys = await this.keys();
		keys.forEach(async (val) => {
			await func(val, that);
		});
	}

}

export { Cache };
