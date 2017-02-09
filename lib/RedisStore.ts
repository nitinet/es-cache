import * as Types from './Types';
import * as redis from 'redis';

export default class RedisStore extends Types.IStore {
	host: string = null;
	port: number;
	client: redis.RedisClient = null;

	constructor(option: redis.ClientOpts) {
		super();
		this.host = option.host ? option.host : "localhost";
		this.port = option.port ? option.port : 6379;
		this.client = redis.createClient(option);
	}

	async get(key: (string | number | symbol)): Promise<any> {
		return null;
	}

	put(key: (string | number | symbol), val: any, expire?: number): Promise<boolean> {
		return null;
	}

	del(key: (string | number | symbol)): boolean {
		return false;
	}

	clear(): void {

	}

	size(): number {
		return 0;
	}

	keys(): Array<any> {
		return null;
	}
}