import IStore from './IStore.js';
export default class Memcache extends IStore {
    client;
    prefix;
    constructor(client, prefix) {
        super();
        this.client = client;
        this.prefix = prefix ?? 'cache' + (Math.random() * 1000).toFixed(0);
    }
    keyCode(key) {
        let keyCode = super.keyCode(key);
        return this.prefix + keyCode;
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
            let temp = this.JsonParse(jsonStr);
            result = this.toValueType(temp);
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
        let jsonStrs = await new Promise((res, rej) => {
            this.client.getMulti(keyCodes, (err, data) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(data);
                }
            });
        });
        let res = keys.map(k => {
            let jsonStr = jsonStrs[this.keyCode(k)];
            if (jsonStr) {
                let temp = this.JsonParse(jsonStr);
                return this.toValueType(temp);
            }
            else
                return null;
        });
        res = await Promise.all(res.map(async (r, i) => {
            if (r)
                return r;
            else if (this.valueFunction) {
                let key = keys[i];
                let temp = await this.valueFunction(key);
                if (temp != null)
                    this.put(key, temp, this.ttl);
                return temp;
            }
            else
                return null;
        }));
        return res;
    }
    async put(key, val, ttl) {
        try {
            if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
                throw new Error('timeout is not a number or less then 0');
            }
            if (val == null) {
                throw new Error('Value cannot be a null');
            }
            let objJson = this.JsonStringify(val);
            return await new Promise((res, rej) => {
                this.client.set(this.keyCode(key), objJson, (this.ttl / 1000), (err, data) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(data);
                    }
                });
            });
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
    async clear() { }
    async size() { return 0; }
    async keys() { return new Array(); }
}
//# sourceMappingURL=Memcache.js.map