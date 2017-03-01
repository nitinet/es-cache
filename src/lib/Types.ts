import * as crypto from 'crypto';

export abstract class IStore<K, V> {
	valueFunction: StoreCallback<K, V> = null;
	expire: number = 86400000;
	timeoutCallback: StoreCallback<K, V> = null;
	limit: number = null;

	constructor() {
	}

	protected keyCode(key: K | string | number | boolean | symbol): string {
		if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
			return key.toString();
		} else {
			let hash = crypto.createHash('sha256');
			hash.update(JSON.stringify(key));
			return hash.digest('latin1');
		}
	}

	abstract get(key: K): Promise<V>;
	abstract put(key: K, val: V, expire?: number, timeoutCallback?: StoreCallback<K, V>): Promise<boolean>;
	abstract del(key: K): Promise<boolean>;
	abstract clear(): void;
	abstract size(): Promise<number>;
	abstract keys(): Array<K>;
}

export interface StoreCallback<K, V> {
	(key?: K): Promise<V>;
}

export interface IOption<K, V> {
	valueFunction?: StoreCallback<K, V>;
	expire?: number;
	timeoutCallback?: StoreCallback<K, V>;
	limit?: number;
	store?: {
		type?: string;
		primitive?: boolean;
	}
}

export class StoreValue<K, V> {
	key: any = null;
	value: any = null;
	valueFunc: StoreCallback<K, V> = null;
	expire: number = null;
	timeout: NodeJS.Timer = null;
	timeoutCallback: StoreCallback<K, V> = null;

	constructor() { }
}