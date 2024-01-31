import * as types from './types/index.js';
import IStore from './store/IStore.js';

class Cache<K, V> {
	opts: types.IOption<K, V>;
	private _store!: IStore<K, V>;

	constructor(opts?: types.IOption<K, V>) {
		this.opts = opts ?? {};
		this.opts.storeType = this.opts.storeType ?? 'local';

		this.init(this.opts);
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

		this._store.valueFunction = options.valueFunction ?? null;
		this._store.ttl = options.ttl ?? 86400000;

		this._store.limit = options.limit ?? null;
		this._store.valueType = options.valueType ?? null;
		if (this._store.valueType) this._store.transformer = await import('class-transformer');
	}

	async get(key: K): Promise<V | null> {
		return this._store.get(key);
	}

	async getOrThrow(key: K): Promise<NonNullable<V>> {
		let val = await this.get(key);
		if (!val) throw new EvalError(this.opts.errorMsg ?? 'Value Not Found');
		return val;
	}

	async gets(keys: K[]): Promise<(V | null)[]> {
		return this._store.gets(keys);
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

		await Promise.all(keys.map(async (key) => {
			let val = await this.get(key);
			if (val) await func(val, key, that);
		}));
	}

}

export default Cache;
