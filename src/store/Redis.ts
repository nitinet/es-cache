// @ts-ignore
import * as redis from 'redis';

import IStore from './IStore.js';

export default class Redis<K, V> extends IStore<K, V> {
	private prefix: string;
	private keyPrefix: string;
	private client: redis.RedisClientType<any>;

	constructor(client: redis.RedisClientType, prefix?: string) {
		super();
		this.client = client;
		this.prefix = prefix ?? 'cache' + (Math.random() * 1000).toFixed(0);
		this.keyPrefix = this.prefix + '-keys';
	}

	protected keyCode(key: K): string {
		let keyCode = super.keyCode(key);
		return this.prefix + keyCode;
	}

	async get(key: K): Promise<V | null> {
		let jsonStr = await this.client.get(this.keyCode(key));

		let result: V | null = null;
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

	async gets(keys: K[]): Promise<(V | null)[]> {
		let keyCodes = keys.map(k => this.keyCode(k));
		let jsonStrs = await this.client.mGet(keyCodes);
		let res = await Promise.all(jsonStrs.map(async (jsonStr, i) => {
			let result: V | null = null;
			if (jsonStr) {
				let temp = this.JsonParse(jsonStr);
				result = this.toValueType(temp);
			} else if (this.valueFunction) {
				let key = keys[i];
				result = await this.valueFunction(key);
				if (result != null) this.put(key, result, this.ttl);
			}
			return result;
		}));
		return res;
	}

	async put(key: K, val: V, ttl?: number): Promise<boolean> {
		try {
			if (val == null) {
				throw new Error('Value cannot be a null');
			}

			if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
				throw new Error('timeout is not a number or less then 0');
			}

			let objJson = this.JsonStringify(val);

			await this.client.set(this.keyCode(key), objJson);
			ttl = ttl ?? this.ttl;
			if (ttl) this.client.expire(this.keyCode(key), (ttl / 1000));

			// Removing Overlimit element
			await this.client.lPush(this.keyPrefix, super.keyCode(key));

			if (this.limit) {
				let keys = await this.keys();
				while (this.limit < keys.length) {
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