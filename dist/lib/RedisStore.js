"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types = require("./Types");
const redis = require("redis");
class RedisStore extends Types.IStore {
    constructor(option) {
        super();
        this.host = null;
        this.prefix = null;
        this.client = null;
        this.host = option.host = option.host ? option.host : "localhost";
        this.port = option.port = option.port ? option.port : 6379;
        this.prefix = option.prefix ? option.prefix : "cache" + (Math.random() * 1000).toFixed(0);
        this.client = redis.createClient(option);
    }
    async get(key) {
        let s = await new Promise((res, rej) => {
            this.client.hget(this.keyCode(key), (err, data) => {
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
            this.put(key, result, this.expire, this.timeoutCallback);
        }
        return result;
    }
    async put(key, val, expire, timeoutCallback) {
        try {
            if (expire && !(typeof expire == 'number' || !isNaN(expire) || expire <= 0)) {
                throw new Error("timeout is not a number or less then 0");
            }
            if (timeoutCallback && typeof timeoutCallback !== 'function') {
                throw new Error('Cache timeout callback must be a function');
            }
            if (val == null) {
                throw new Error('Value cannot be a null');
            }
            else if (typeof val === 'function') {
                throw new Error('Value cannot be a function');
            }
            let data = JSON.stringify(val);
            await new Promise((resolve, rej) => {
                this.client.set(this.keyCode(key), data, (err, res) => {
                    if (err)
                        rej(err);
                    resolve(res);
                });
            });
            await new Promise((res, rej) => {
                this.client.lpush(this.prefix, this.keyCode(key), (err, data) => {
                    if (err)
                        rej(err);
                    res(data);
                });
            });
            if (this.limit && typeof this.limit == 'function') {
                while (await this.limit()) {
                    let firstKey = await new Promise((res, rej) => {
                        this.client.lpop(this.prefix, (err, data) => {
                            if (err)
                                rej(err);
                            res(data);
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
            this.client.lrem(this.prefix, hashKey, (err, data) => {
                if (err)
                    rej(err);
                res(data);
            });
        });
        return this.client.del(hashKey);
    }
    async clear() {
        let keys = await new Promise((res, rej) => {
            this.client.lrange(this.prefix, 0, -1, (err, data) => {
                if (err)
                    rej(err);
                res(data);
            });
        });
        for (let key of keys) {
            this.client.del(key);
        }
    }
    async size() {
        return await new Promise((res, rej) => {
            this.client.llen(this.prefix, (err, data) => {
                if (err)
                    rej(err);
                res(data);
            });
        });
    }
    async keys() {
        return null;
    }
}
exports.default = RedisStore;
