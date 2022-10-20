import StoreCallback from './StoreCallback.js';
import IEntityType from '../util/IEntityType.js';

interface IOption<K, V> {
	valueFunction?: StoreCallback<K, V>;
	expire?: number;
	timeoutCallback?: StoreCallback<K, V>;
	limit?: () => Promise<boolean>;
	storeType?: string;
	client?: any;
	prefix?: string;
	valueType?: IEntityType<V>;
}

export default IOption;
