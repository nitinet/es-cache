import IStore from './IStore.js';
export default class Redis extends IStore {
    prefix;
    keyPrefix;
    client;
    constructor(client, prefix) {
        super();
        this.client = client;
        this.prefix = prefix ?? 'cache' + (Math.random() * 1000).toFixed(0);
        this.keyPrefix = this.prefix + '-keys';
    }
    keyCode(key) {
        let keyCode = super.keyCode(key);
        return this.prefix + keyCode;
    }
    async get(key) {
        let jsonStr = await this.client.get(this.keyCode(key));
        let result = null;
        if (jsonStr) {
            let temp = this.JsonParse(jsonStr);
            result = await this.toValueType(temp);
        }
        if (result == null && this.valueFunction) {
            result = await this.valueFunction(key);
            if (result != null) {
                this.put(key, result, this.ttl);
            }
        }
        return result;
    }
    async gets(keys) {
        let keyCodes = keys.map(k => this.keyCode(k));
        let jsonStrs = await this.client.mGet(keyCodes);
        let res = await Promise.all(jsonStrs.map(async (jsonStr, i) => {
            let result = null;
            if (jsonStr) {
                let temp = this.JsonParse(jsonStr);
                result = this.toValueType(temp);
            }
            else if (this.valueFunction) {
                let key = keys[i];
                result = await this.valueFunction(key);
                if (result != null)
                    this.put(key, result, this.ttl);
            }
            return result;
        }));
        return res;
    }
    async put(key, val, ttl) {
        try {
            if (val == null) {
                throw new Error('Value cannot be a null');
            }
            if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
                throw new Error('timeout is not a number or less then 0');
            }
            let objJson = this.JsonStringify(val);
            await this.client.set(this.keyCode(key), objJson);
            ttl = ttl ?? this.ttl;
            if (ttl)
                this.client.expire(this.keyCode(key), (ttl / 1000));
            await this.client.lPush(this.keyPrefix, super.keyCode(key));
            if (this.limit) {
                let keys = await this.keys();
                while (this.limit < keys.length) {
                    let firstKey = await this.client.lPop(this.keyPrefix);
                    this.client.del(this.prefix + firstKey);
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
        await this.client.lRem(this.keyPrefix, 0, super.keyCode(key));
        let result = await this.client.del(this.keyCode(key));
        return !!result;
    }
    async clear() {
        let keys = await this.keys();
        for (let key of keys) {
            this.del(key);
        }
    }
    async size() {
        let res = await this.client.lLen(this.keyPrefix);
        return res;
    }
    async keys() {
        let keys = await this.client.lRange(this.keyPrefix, 0, -1);
        return keys;
    }
}
//# sourceMappingURL=Redis.js.map