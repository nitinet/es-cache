// import memcached from 'memcached';

import IStore from './IStore';
import * as types from '../types';

export default class Memcache<K, V> extends IStore<K, V> {
	// private client: memcached = null;
	private client = null;

	constructor(option) {
		super();
		option.host = option.host || 'localhost';
		option.port = option.port || 11211;
		option.prefix = option.prefix || 'cache' + (Math.random() * 1000).toFixed(0);

		this.init(option);
	}

	async	init(option) {
		// @ts-ignore
		let memcached = await import('memcached');
		this.client = new memcached.default(`${option.host}:${option.port}`, option);
	}

	async get(key: K): Promise<V> {
		let s = await new Promise<string>((res, rej) => {
			this.client.get(this.keyCode(key), (err, data) => {
				if (err) rej(err);
				res(data);
			});
		})
		let result = null;
		if (s) {
			result = JSON.parse(s);
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

			let data = JSON.stringify(val);

			await new Promise<any>((res, rej) => {
				this.client.set(this.keyCode(key), data, (this.expire / 1000), (err, result) => {
					if (err) rej(err);
					res(result);
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
		return await new Promise<any>((res, rej) => {
			return this.client.del(hashKey, (err) => {
				if (err) rej(err);
				res(true);
			});
		});
	}

	async clear(): Promise<void> {
		return null;
	}

	async size(): Promise<number> {
		return null;
	}

	async	keys(): Promise<Array<K>> {
		return null;
	}
}