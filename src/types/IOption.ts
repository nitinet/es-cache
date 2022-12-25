import StoreCallback from './StoreCallback.js';
import IEntityType from '../util/IEntityType.js';

interface IOption<K, V> {
	valueFunction?: StoreCallback<K, V>;
	ttl?: number;
	limit?: number;
	storeType?: string;
	client?: any;
	prefix?: string;
	valueType?: IEntityType<V>;
}

export default IOption;
