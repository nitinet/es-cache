import * as Types from './Types';
import * as redis from 'redis';

export default class RedisStore<K, V> extends Types.IStore<K, V> {
	host: string = null;
	port: number;
	client: redis.RedisClient = null;

	constructor(option: redis.ClientOpts) {
		super();
		this.host = option.host ? option.host : "localhost";
		this.port = option.port ? option.port : 6379;
		this.client = redis.createClient(option);
	}

	async get(key: K): Promise<any> {
		return null;
	}

	put(key: K, val: V, expire?: number): Promise<boolean> {
		return null;
	}

	del(key: K): boolean {
		return false;
	}

	clear(): void {

	}

	size(): number {
		return 0;
	}

	keys(): Array<K> {
		return null;
	}
}