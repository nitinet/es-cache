// @ts-ignore
import memcached from 'memcached';

import IStore from './IStore';
import * as types from '../types';

export default class Memcache<K, V> extends IStore<K, V> {
	private client: memcached = null;

	constructor(opts) {
		super();
		opts = opts || {};
		opts.host = opts.host || 'localhost';
		opts.port = opts.port || 11211;
		opts.prefix = opts.prefix || 'cache' + (Math.random() * 1000).toFixed(0);

		this.init(opts);
	}

	async init(opts) {
		// @ts-ignore
		let modObj: { default: typeof import('memcached') } = null;
		try {
			let modName = 'memcached';
			modObj = await import(modName);
		} catch (err) {
			throw new Error('memcached dependency is missing');
		}
		this.client = new modObj.default(`${opts.host}:${opts.port}`, opts);
	}

	async get(key: K): Promise<V> {
		let jsonStr = await new Promise<string>((res, rej) => {
			this.client.get(this.keyCode(key), (err, data) => {
				if (err) { rej(err); }
				else { res(data); }
			});
		})
		let result = null;
		if (jsonStr) {
			result = this.JsonParse(jsonStr);
		}
		if (result == null && this.valueFunction) {
			result = await this.valueFunction(key);
			if (result != null) {
				this.put(key, result, this.expire, this.timeoutCallback);
			}
		}
		return result;
	}

	async put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean> {
		try {
			if (expire && !(typeof expire == 'number' || !isNaN(expire) || expire <= 0)) {
				throw new Error('timeout is not a number or less then 0');
			}

			if (timeoutCallback && typeof timeoutCallback !== 'function') {
				throw new Error('Cache timeout callback must be a function');
			}

			if (val == null) {
				throw new Error('Value cannot be a null');
			}

			let objJson = this.JsonStringify(val);

			await new Promise((res, rej) => {
				this.client.set(this.keyCode(key), objJson, (this.expire / 1000), (err, data) => {
					if (err) { rej(err); }
					else { res(data); }
				});
			});

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async del(key: K): Promise<boolean> {
		if (!key) {
			return false;
		}
		let hashKey = this.keyCode(key);
		return new Promise<boolean>((res, rej) => {
			return this.client.del(hashKey, (err, data) => {
				if (err) { rej(err); }
				else { res(data); }
			});
		});
	}

	async clear(): Promise<void> {
		return null;
	}

	async size(): Promise<number> {
		return null;
	}

	async keys(): Promise<K[]> {
		return null;
	}
}