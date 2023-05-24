import IStore from './IStore.js';
import * as types from '../types/index.js';

export default class Local<K, V> extends IStore<K, V> {
	_store: Map<string, types.StoreValue<K, V>> = new Map<string, types.StoreValue<K, V>>();
	_keys: Array<K> = new Array<K>();

	constructor() {
		super();
	}

	private setupExpire(store: types.StoreValue<K, V>) {
		let that = this;
		if (store.ttl) {
			setTimeout(function () {
				that.del(store.key);
			}, store.ttl);
		}
	}

	async get(key: K): Promise<V | null> {
		let s = this._store.get(this.keyCode(key));
		let result: V | null = null;
		if (s) {
			result = s.value;
		} else if (this.valueFunction) {
			result = await this.valueFunction(key);
			if (result != null) {
				this.put(key, result, this.ttl);
			}
		}
		return result;
	}

	async gets(keys: K[]): Promise<(V | null)[]> {
		let temp = keys.map(key => this._store.get(this.keyCode(key)));
		let data = await Promise.all(temp.map(async (s, i) => {
			let result: V | null = null;
			if (s) {
				result = s.value;
			} else if (this.valueFunction) {
				let key = keys[i];
				result = await this.valueFunction(key);
				if (result != null) this.put(key, result, this.ttl);
			}
			return result;
		}));
		return data;
	}

	async put(key: K, val: V, ttl?: number): Promise<boolean> {
		try {
			if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
				throw new Error("timeout is not a number or less then 0");
			}

			if (val == null) {
				throw new Error('Value cannot be a null');
			}

			let rec: types.StoreValue<K, V> = new types.StoreValue(key, val, ttl ?? this.ttl);
			this._store.set(this.keyCode(key), rec);
			this.setupExpire(rec);

			// Removing Overlimit element
			this._keys.push(key);
			if (this.limit) {
				while (this.limit < this._keys.length) {
					let firstKey = this._keys.shift();
					if (firstKey) this.del(firstKey);
				}
			}
			return rec.value;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async del(key: K): Promise<boolean> {
		if (!key) {
			return false;
		}
		let keyIndex = this._keys.indexOf(key);
		if (keyIndex != -1) {
			this._keys.splice(keyIndex, 1);
		}
		let val = this._store.get(this.keyCode(key));
		if (val) {
			this._store.delete(this.keyCode(key));
			return true;
		}
		return false;
	}

	clear(): void {
		for (let key of this._keys) {
			this.del(key);
		}
	}

	async size(): Promise<number> {
		return this._keys.length;
	}

	async keys(): Promise<Array<K>> {
		return this._keys;
	}
}