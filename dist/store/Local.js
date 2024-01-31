import IStore from './IStore.js';
import * as types from '../types/index.js';
export default class Local extends IStore {
    _store = new Map();
    _keys = new Array();
    setupExpire(store) {
        let that = this;
        if (store.ttl) {
            setTimeout(function () {
                that.del(store.key);
            }, store.ttl);
        }
    }
    async get(key) {
        let s = this._store.get(this.keyCode(key));
        let result = null;
        if (s) {
            result = s.value;
        }
        else if (this.valueFunction) {
            try {
                result = await this.valueFunction(key);
                if (result != null) {
                    this.put(key, result, this.ttl);
                }
            }
            catch (err) {
                console.log(err);
            }
        }
        return result;
    }
    async gets(keys) {
        return await Promise.all(keys.map(key => this.get(key)));
    }
    async put(key, val, ttl) {
        try {
            if (ttl && !(typeof ttl == 'number' || !isNaN(ttl) || ttl <= 0)) {
                throw new Error("timeout is not a number or less then 0");
            }
            if (val == null) {
                throw new Error('Value cannot be a null');
            }
            let rec = new types.StoreValue(key, val, ttl ?? this.ttl);
            this._store.set(this.keyCode(key), rec);
            this.setupExpire(rec);
            this._keys.push(key);
            if (this.limit) {
                while (this.limit < this._keys.length) {
                    let firstKey = this._keys.shift();
                    if (firstKey)
                        this.del(firstKey);
                }
            }
            return rec.value;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async del(key) {
        if (!key) {
            return false;
        }
        let keyIndex = this._keys.indexOf(key);
        if (keyIndex != -1) {
            this._keys.splice(keyIndex, 1);
        }
        let val = this._store.get(this.keyCode(key));
        if (val) {
            this._store.delete(this.keyCode(key));
            return true;
        }
        return false;
    }
    clear() {
        for (let key of this._keys) {
            this.del(key);
        }
    }
    async size() {
        return this._keys.length;
    }
    async keys() {
        return this._keys;
    }
}
//# sourceMappingURL=Local.js.map