// @ts-ignore
import memcached from 'memcached';

import IStore from './IStore.js';

export default class Memcache<K, V> extends IStore<K, V> {
	private client: memcached = null;
	private prefix: string = null;

	constructor(client: memcached, prefix: string) {
		super();
		this.client = client;
		this.prefix = prefix ?? 'cache' + (Math.random() * 1000).toFixed(0);
	}

	protected keyCode(key: K): string {
		let keyCode = super.keyCode(key);
		return this.prefix + keyCode;
	}

	async get(key: K): Promise<V> {
		let jsonStr = await new Promise<string>((res, rej) => {
			this.client.get(this.keyCode(key), (err: Error, data: string) => {
				if (err) { rej(err); }
				else { res(data); }
			});
		});
		let result: V = null;
		if (jsonStr) {
			let temp = this.JsonParse(jsonStr);
			result = await this.toValueType(temp);
		}
		if (result == null && this.valueFunction) {
			result = await this.valueFunction(key);
			if (result != null) {
				this.put(key, result, this.ttl);
			}
		}
		return result;
	}

	async put(key: K, val: V, ttl?: number): Promise<boolean> {
		try {
			if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
				throw new Error('timeout is not a number or less then 0');
			}

			if (val == null) {
				throw new Error('Value cannot be a null');
			}

			let objJson = this.JsonStringify(val);

			return await new Promise<boolean>((res, rej) => {
				this.client.set(this.keyCode(key), objJson, (this.ttl / 1000), (err: Error, data: boolean) => {
					if (err) { rej(err); }
					else { res(data); }
				});
			});
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
			return this.client.del(hashKey, (err: Error, data: boolean) => {
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