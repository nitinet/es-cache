import StoreCallback from '../types/StoreCallback.js';
import IEntityType from '../util/IEntityType.js';

abstract class IStore<K, V> {
	valueFunction: StoreCallback<K, V> | null = null;
	ttl: number = 86400000;
	limit: number | null = null;
	valueType: IEntityType<V> | null = null;

	transformer: typeof import('class-transformer') | null = null;

	protected keyCode(key: K): string {
		if (key == null) {
			throw new Error('Invalid Key');
		} else if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
			return key.toString();
		} else {
			return JSON.stringify(key);
		}
	}

	protected JsonParse(jsonStr: string) {
		let res = JSON.parse(jsonStr, (key, value) => {
			if (typeof value === "string" && /^\d+n$/.test(value)) {
				return BigInt(value.substring(0, value.length - 1));
			} else {
				return value;
			}
		});
		return res;
	}

	toValueType(obj: any) {
		let res: V | null = null;
		if (this.valueType && this.transformer) {
			try {
				res = this.transformer.plainToClass(this.valueType, obj);
			} catch (err) {
				console.error(err);
			}
		} else {
			res = obj;
		}
		return res;
	}

	protected JsonStringify(val: any) {
		let res = JSON.stringify(val, (key, value) => {
			if (typeof value === "bigint") {
				return value.toString() + 'n';
			} else {
				return value
			}
		});
		return res;
	}

	abstract get(key: K): Promise<V | null>;
	abstract gets(keys: K[]): Promise<(V | null)[]>;
	abstract put(key: K, val: V, ttl?: number): Promise<boolean>;
	abstract del(key: K): Promise<boolean>;
	abstract clear(): void;
	abstract size(): Promise<number>;
	abstract keys(): Promise<K[]>;
}

export default IStore;
