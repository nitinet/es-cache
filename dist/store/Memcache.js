import IStore from './IStore.js';
export default class Memcache extends IStore {
    constructor(opts) {
        super();
        this.client = null;
        opts = opts || {};
        opts.host = opts.host || 'localhost';
        opts.port = opts.port || 11211;
        opts.prefix = opts.prefix || 'cache' + (Math.random() * 1000).toFixed(0);
        this.init(opts);
    }
    async init(opts) {
        let modObj = null;
        try {
            modObj = await import('memcached');
        }
        catch (err) {
            throw new Error('memcached dependency is missing');
        }
        this.client = new modObj.default(`${opts.host}:${opts.port}`, opts);
    }
    async get(key) {
        let jsonStr = await new Promise((res, rej) => {
            this.client.get(this.keyCode(key), (err, data) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(data);
                }
            });
        });
        let result = null;
        if (jsonStr) {
            result = this.JsonParse(jsonStr);
        }
        if (result == null && this.valueFunction) {
            result = await this.valueFunction(key);
            if (result != null) {
                this.put(key, result, this.expire, this.timeoutCallback);
            }
        }
        return result;
    }
    async put(key, val, expire, timeoutCallback) {
        try {
            if (expire && !(typeof expire == 'number' || !isNaN(expire) || expire <= 0)) {
                throw new Error('timeout is not a number or less then 0');
            }
            if (timeoutCallback && typeof timeoutCallback !== 'function') {
                throw new Error('Cache timeout callback must be a function');
            }
            if (val == null) {
                throw new Error('Value cannot be a null');
            }
            let objJson = this.JsonStringify(val);
            await new Promise((res, rej) => {
                this.client.set(this.keyCode(key), objJson, (this.expire / 1000), (err, data) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(data);
                    }
                });
            });
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    async del(key) {
        if (!key) {
            return false;
        }
        let hashKey = this.keyCode(key);
        return new Promise((res, rej) => {
            return this.client.del(hashKey, (err, data) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(data);
                }
            });
        });
    }
    async clear() {
        return null;
    }
    async size() {
        return null;
    }
    async keys() {
        return null;
    }
}
//# sourceMappingURL=Memcache.js.map