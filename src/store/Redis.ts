// import * as redis from 'redis';

import IStore from './IStore';
import * as types from '../types';
import * as utils from '@inheap/utils';

export default class Redis<K, V> extends IStore<K, V> {
	private prefix: string = null;
	private keyPrefix: string = null;
	// private client: redis.RedisClientType<any> = null;
	private client = null;

	// constructor(opts: redis.RedisClientOptions & { prefix: string }) {
	constructor(opts) {
		super();
		opts = opts || { prefix: null };
		opts.url = opts.url || 'redis://localhost:6379';
		this.prefix = opts.prefix || 'cache' + (Math.random() * 1000).toFixed(0);
		this.keyPrefix = this.prefix + '-keys';

		this.init(opts);
	}

	async init(opts) {
		let redis: typeof import('redis') = null;
		try {
			redis = await import('redis');
		} catch (err) {
			throw new Error('Redis dependency is missing');
		}
		this.client = redis.createClient(opts);
		await this.client.connect();
	}

	protected keyCode(key: K): string {
		let keyCode = super.keyCode(key);
		return this.prefix + keyCode;
	}

	async get(key: K): Promise<V> {
		let jsonStr = await this.client.get(this.keyCode(key));

		let result = null;
		if (jsonStr) {
			if (this.valueType) {
				let obj = this.JsonParse(jsonStr);
				result = utils.parseStrict(obj, new this.valueType());
			} else {
				result = this.JsonParse(jsonStr);
			}
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

			await this.client.set(this.keyCode(key), objJson);
			if (this.expire) {
				this.client.expire(this.keyCode(key), (this.expire / 1000));
			}

			// Removing Overlimit element
			await this.client.lPush(this.keyPrefix, super.keyCode(key));

			if (this.limit && typeof this.limit == 'function') {
				while (await this.limit()) {
					let firstKey = await this.client.lPop(this.keyPrefix);
					this.client.del(this.prefix + firstKey);
				}
			}
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
		await this.client.lRem(this.keyPrefix, 0, super.keyCode(key));
		let result = await this.client.del(this.keyCode(key));
		return !!result;
	}

	async clear(): Promise<void> {
		let keys = await this.keys();
		for (let key of keys) {
			this.del(key);
		}
	}

	async size(): Promise<number> {
		let res = await this.client.lLen(this.keyPrefix);
		return res;
	}

	async keys(): Promise<K[]> {
		let keys: any[] = await this.client.lRange(this.keyPrefix, 0, -1);
		return keys;
	}

}