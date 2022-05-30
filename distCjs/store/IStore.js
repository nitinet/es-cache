"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IStore {
    constructor() {
        this.valueFunction = null;
        this.expire = 86400000;
        this.timeoutCallback = null;
        this.limit = null;
        this.valueType = null;
    }
    keyCode(key) {
        if (key == null) {
            throw new Error('Invalid Key');
        }
        else if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
            return key.toString();
        }
        else {
            return JSON.stringify(key);
        }
    }
    JsonParse(jsonStr) {
        let res = JSON.parse(jsonStr, (key, value) => {
            if (typeof value === "string" && /^\d+n$/.test(value)) {
                return BigInt(value.substr(0, value.length - 1));
            }
            else {
                return value;
            }
        });
        return res;
    }
    JsonStringify(val) {
        let res = JSON.stringify(val, (key, value) => {
            if (typeof value === "bigint") {
                return value.toString() + 'n';
            }
            else {
                return value;
            }
        });
        return res;
    }
}
exports.default = IStore;
//# sourceMappingURL=IStore.js.map