type StoreCallback<K, V> = (key: K) => Promise<V>;

type StoreType = 'local' | 'redis' | 'memcache';

type IOption<K, V> = {
  valueFunction?: StoreCallback<K, V>;
  ttl?: number;
  limit?: number;
  storeType?: StoreType;
  client?: any;
  prefix?: string;
  errorMsg?: string;
  transformer?: (data: string) => V;
};

export { StoreCallback, StoreType, IOption };
