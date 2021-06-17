"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IStore_1 = require("./IStore");
const utils = require("@inheap/utils");
class Redis extends IStore_1.default {
    constructor(opts) {
        super();
        this.keyPrefix = null;
        this.client = null;
        opts = opts || {};
        opts.host = opts.host || 'localhost';
        opts.port = opts.port || 6379;
        opts.prefix = opts.prefix || 'cache' + (Math.random() * 1000).toFixed(0);
        this.keyPrefix = '-keys';
        this.init(opts);
    }
    async init(opts) {
        let redis = await Promise.resolve().then(() => require('redis'));
        this.client = redis.createClient(opts);
    }
    async get(key) {
        let json = await new Promise((res, rej) => {
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
        if (json) {
            if (this.valueType) {
                let obj = JSON.parse(json);
                result = utils.objectParse(obj, this.valueType);
            }
            else {
                result = JSON.parse(json);
            }
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
            let objJson = JSON.stringify(val);
            await new Promise((res, rej) => {
                this.client.set(this.keyCode(key), objJson, (err, data) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(data);
                    }
                });
            });
            if (this.expire) {
                this.client.expire(this.keyCode(key), (this.expire / 1000));
            }
            await new Promise((res, rej) => {
                this.client.lpush(this.keyPrefix, this.keyCode(key), (err, data) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(data);
                    }
                });
            });
            if (this.limit && typeof this.limit == 'function') {
                while (await this.limit()) {
                    let firstKey = await new Promise((res, rej) => {
                        this.client.lpop(this.keyPrefix, (err, data) => {
                            if (err) {
                                rej(err);
                            }
                            else {
                                res(data);
                            }
                        });
                    });
                    this.client.del(firstKey);
                }
            }
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
        await new Promise((res, rej) => {
            this.client.lrem(this.keyPrefix, 0, hashKey, (err, data) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(data);
                }
            });
        });
        return this.client.del(hashKey);
    }
    async clear() {
        let keys = await this.keys();
        for (let key of keys) {
            this.client.del(key);
        }
    }
    async size() {
        return new Promise((res, rej) => {
            this.client.llen(this.keyPrefix, (err, data) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(data);
                }
            });
        });
    }
    async keys() {
        let keys = await new Promise((res, rej) => {
            this.client.lrange(this.keyPrefix, 0, -1, (err, data) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(data);
                }
            });
        });
        return keys;
    }
}
exports.default = Redis;
//# sourceMappingURL=Redis.js.map