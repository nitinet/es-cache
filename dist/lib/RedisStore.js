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
        this.primitive = false;
        this.host = option.host = option.host ? option.host : "localhost";
        this.port = option.port = option.port ? option.port : 6379;
        this.prefix = option.prefix ? option.prefix : "cache" + (Math.random() * 1000).toFixed(0);
        this.client = redis.createClient(option);
        this.primitive = option.primitive ? option.primitive : false;
    }
    async get(key, ...opts) {
        let s = await new Promise((res, rej) => {
            this.client.hgetall(this.keyCode(key), (err, data) => {
                if (err)
                    rej(err);
                res(data);
            });
        });
        let result = null;
        if (s) {
            for (let i = 0; i < s.length; i = i + 2) {
                if (this.primitive) {
                    result[s[i]] = s[i + 1];
                }
                else {
                    result[s[i]] = JSON.parse(s[i + 1]);
                }
            }
        }
        if (result == null && this.valueFunction) {
            result = await this.valueFunction(key, opts);
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
            if (val && typeof val === 'function') {
                throw new Error('Value cannot be a function');
            }
            let data = new Array();
            let propKeys = Reflect.ownKeys(val);
            for (let i = 0, j = 0; i < propKeys.length; i++, j += 2) {
                let prop = propKeys[i];
                data[j] = prop.toString();
                if (this.primitive) {
                    data[j + 1] = Reflect.get(val, prop);
                }
                else {
                    data[j + 1] = JSON.stringify(Reflect.get(val, prop));
                }
            }
            await new Promise((resolve, rej) => {
                this.client.hmset(this.keyCode(key), data, (err, res) => {
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
            let keysLength = await this.size();
            if (this.limit && keysLength > this.limit) {
                let firstKey = await new Promise((res, rej) => {
                    this.client.lpop(this.prefix, (err, data) => {
                        if (err)
                            rej(err);
                        res(data);
                    });
                });
                this.client.del(firstKey);
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
    keys() {
        return null;
    }
}
exports.default = RedisStore;
