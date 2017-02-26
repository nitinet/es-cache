"use strict";
const Types = require("./Types");
const redis = require("redis");
class RedisStore extends Types.IStore {
    constructor(option) {
        super();
        this.host = null;
        this.client = null;
        this.host = option.host ? option.host : "localhost";
        this.port = option.port ? option.port : 6379;
        this.client = redis.createClient(option);
    }
    async get(key) {
        return null;
    }
    put(key, val, expire) {
        return null;
    }
    del(key) {
        return false;
    }
    clear() {
    }
    size() {
        return 0;
    }
    keys() {
        return null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RedisStore;
