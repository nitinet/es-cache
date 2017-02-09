export abstract class IStore {
	valueFunction: StoreCallback = null;
	expire: number = 86400000;
	timeoutCallback: StoreCallback = null;
	limit: number = null;

	constructor() {
	}

	abstract get(key: (string | number | symbol)): Promise<any>;
	abstract put(key: (string | number | symbol), val: any, expire?: number, timeoutCallback?: StoreCallback): Promise<boolean>;
	abstract del(key: (string | number | symbol)): boolean;
	abstract clear(): void;
	abstract size(): number;
	abstract keys(): Array<any>;
}

export interface StoreCallback {
	(key?: (string | number | symbol)): Promise<any>;
}

export interface IOption {
	valueFunction?: StoreCallback;
	expire?: number;
	timeoutCallback?: StoreCallback;
	limit?: number;
	store?: {
		type?: string;
	}
}

export class StoreValue {
	key: any = null;
	value: any = null;
	valueFunc: StoreCallback = null;
	expire: number = null;
	timeout: NodeJS.Timer = null;
	timeoutCallback: StoreCallback = null;

	constructor() { }
}