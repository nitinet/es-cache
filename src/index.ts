import * as types from './types/index.js';
import IStore from './store/IStore.js';
import LocalStore from './store/Local.js';

class Cache<K, V extends any> {
	private _store: IStore<K, V>;

	constructor(opts?: types.IOption<K, V>) {
		opts = opts || {};
		opts.storeType = opts.storeType || 'local';
		this._store = new LocalStore();

		this.init(opts);
	}

	private async init(options: types.IOption<K, V>) {
		let module;
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
			default:
				module = await import('./store/Local.js');
		}

		this._store = new module.default(options.client, options.prefix);

		this._store.valueFunction = options.valueFunction || null;
		this._store.ttl = options.ttl ?? 86400000;

		this._store.limit = options.limit || null;
		this._store.valueType = options.valueType || null;
	}

	async get(key: K): Promise<V | null> {
		return this._store.get(key);
	}

	async put(key: K, val: V, ttl?: number): Promise<boolean> {
		return this._store.put(key, val, ttl);
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
			let val = await this.get(key);
			if (val) await func(val, key, that);
		});
	}

}

export default Cache;
