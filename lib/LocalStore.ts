import * as Types from './Types';

export default class LocalStore extends Types.IStore {
	_store: Map<string, Types.StoreValue> = new Map<string, Types.StoreValue>();
	_keys: Array<string> = new Array<string>();

	constructor() {
		super();
	}

	private setupExpire(store: Types.StoreValue) {
		let that = this;
		if (store.expire) {
			store.timeout = setTimeout(function () {
				store.value = null;
				if (store.timeoutCallback) {
					store.timeoutCallback(store.key);
				}
				if (!store.valueFunc) {
					that.del(store.key);
				}
			}, store.expire);
		}
	}

	async get(key: (string | number | symbol)): Promise<any> {
		let s = this._store.get(key.toString());
		let result = null;
		if (s) {
			if (s.value == null && s.valueFunc) {
				s.value = await s.valueFunc(s.key);
				this.setupExpire(s);
			}
			result = s.value;
		}
		if (result == null && this.valueFunction) {
			result = await this.valueFunction(key);
			this.put(key, result, this.expire, this.timeoutCallback);
		}
		return result;
	}

	async put(key: (string | number | symbol), val: any, expire?: number, timeoutCallback?: Types.StoreCallback): Promise<boolean> {
		try {
			if (expire && !(typeof expire == 'number' || !isNaN(expire) || expire <= 0)) {
				throw new Error("timeout is not a number or less then 0");
			}

			if (timeoutCallback && typeof timeoutCallback !== 'function') {
				throw new Error('Cache timeout callback must be a function');
			}

			let rec: Types.StoreValue = new Types.StoreValue();
			rec.key = key;
			if (val && typeof val === 'function') {
				rec.valueFunc = val;
				rec.value = await rec.valueFunc(rec.key);
			} else {
				rec.value = val;
			}
			rec.expire = expire;
			rec.timeoutCallback = timeoutCallback;
			this.setupExpire(rec);
			this._store.set(key.toString(), rec);

			// Removing Overlimit element
			let keysLength = this._keys.push(key.toString());
			if (this.limit && keysLength > this.limit) {
				let firstKey = this._keys.shift();
				this.del(firstKey);
			}
			return rec.value;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	del(key: (string | number | symbol)): boolean {
		if (key) {
			key = key.toString();
		} else {
			return false;
		}
		let keyIndex = this._keys.indexOf(key);
		if (keyIndex != -1) {
			this._keys.splice(keyIndex, 1);
		}
		let val = this._store.get(key);
		if (val) {
			if (val.timeout) {
				clearTimeout(val.timeout);
			}
			this._store.delete(key.toString());
			return true;
		}
		return false;
	}

	clear(): void {
		for (let key of this._keys) {
			this.del(key);
		}
	}

	size(): number {
		return this._keys.length;
	}

	keys(): Array<any> {
		return this._keys;
	}
}