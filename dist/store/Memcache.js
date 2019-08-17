"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IStore_1 = require("./IStore");
class Memcache extends IStore_1.default {
    constructor(option) {
        super();
        this.client = null;
        option.host = option.host || 'localhost';
        option.port = option.port || 11211;
        option.prefix = option.prefix || 'cache' + (Math.random() * 1000).toFixed(0);
        this.init(option);
    }
    async init(option) {
        let memcached = await Promise.resolve().then(() => require('memcached'));
        this.client = new memcached.default(`${option.host}:${option.port}`, option);
    }
    async get(key) {
        let s = await new Promise((res, rej) => {
            this.client.get(this.keyCode(key), (err, data) => {
                if (err)
                    rej(err);
                res(data);
            });
        });
        let result = null;
        if (s) {
            result = JSON.parse(s);
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
            let data = JSON.stringify(val);
            await new Promise((res, rej) => {
                this.client.set(this.keyCode(key), data, (this.expire / 1000), (err, result) => {
                    if (err)
                        rej(err);
                    res(result);
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
        return await new Promise((res, rej) => {
            return this.client.del(hashKey, (err) => {
                if (err)
                    rej(err);
                res(true);
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
exports.default = Memcache;
