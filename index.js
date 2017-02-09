"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const LocalStore_1 = require("./lib/LocalStore");
const RedisStore_1 = require("./lib/RedisStore");
class Cache {
    constructor(options) {
        this._store = null;
        if (options) {
            switch (options.store.type) {
                case 'redis': {
                    this._store = new RedisStore_1.default(options.store);
                    break;
                }
                default:
                    this._store = new LocalStore_1.default();
                    break;
            }
            this._store.valueFunction = options.valueFunction ? options.valueFunction : null;
            this._store.expire = options.expire ? options.expire : null;
            this._store.timeoutCallback = options.timeoutCallback ? options.timeoutCallback : null;
            this._store.limit = options.limit ? options.limit : null;
        }
        else {
            this._store = new LocalStore_1.default();
        }
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._store.get(key);
        });
    }
    put(key, val, expire, timeoutCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._store.put(key, val, expire, timeoutCallback);
        });
    }
    del(key) {
        return this._store.del(key);
    }
    clear() {
        this._store.clear();
    }
    size() {
        return this._store.size();
    }
    keys() {
        return this._store.keys();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cache;
