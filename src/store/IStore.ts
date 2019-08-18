import * as crypto from 'crypto';

import StoreCallback from '../types/StoreCallback';
import IEntityType from '../util/IEntityType';

abstract class IStore<K, V> {
	valueFunction: StoreCallback<K, V> = null;
	expire: number = 86400000;
	timeoutCallback: StoreCallback<K, V> = null;
	limit: () => Promise<Boolean> = null;
	valueType: IEntityType<V> = null;

	constructor() {
	}

	protected keyCode(key: K): string {
		if (key == null) {
			return null;
		} else if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
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
	abstract keys(): Promise<Array<K>>;
}

export default IStore;
