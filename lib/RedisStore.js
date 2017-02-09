"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
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
