export abstract class IStore<K, V> {
	valueFunction: StoreCallback<K, V> = null;
	expire: number = 86400000;
	timeoutCallback: StoreCallback<K, V> = null;
	limit: number = null;

	constructor() {
	}

	abstract get(key: K): Promise<any>;
	abstract put(key: K, val: V, expire?: number, timeoutCallback?: StoreCallback<K, V>): Promise<boolean>;
	abstract del(key: K): boolean;
	abstract clear(): void;
	abstract size(): number;
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