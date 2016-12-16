/// <reference path="/usr/local/lib/typings/globals/node/index.d.ts" />

interface StoreCallback {
  (key?: (string | number | symbol)): Promise<any>;
}

interface IOption {
  valueFunction?: StoreCallback;
  expire?: number;
  timeoutCallback?: StoreCallback;
  limit?: number;
}

class StoreValue {
  key: any = null;
  value: any = null;
  valueFunc: StoreCallback = null;
  expire: number = null;
  timeout: NodeJS.Timer = null;
  timeoutCallback: StoreCallback = null;

  constructor() { }
}

class Cache {
  _store: Map<string, StoreValue> = new Map<string, StoreValue>();
  _keys: Array<string> = new Array<string>();

  valueFunction: StoreCallback = null;
  expire: number = 86400000;
  timeoutCallback: StoreCallback = null;
  limit: number = null;

  constructor(options?: IOption) {
    if (options) {
      this.valueFunction = options.valueFunction ? options.valueFunction : null;
      this.expire = options.expire ? options.expire : null;
      this.timeoutCallback = options.timeoutCallback ? options.timeoutCallback : null;
      this.limit = options.limit ? options.limit : null;
    }
  }

  private setupExpire(store: StoreValue) {
    let that = this;
    if (store.expire && !isNaN(store.expire)) {
      store.timeout = setTimeout(function () {
        store.value = null;
        if (store.timeoutCallback) {
          store.timeoutCallback(store.key);
        }
        if (!store.valueFunc) {
          that.del(store.key);
        }
      }, store.expire);
    }
  }

  async get(key: (string | number | symbol)): Promise<any> {
    let s = this._store.get(key.toString());
    let result = null;
    if (s) {
      if (s.value == null && s.valueFunc) {
        s.value = await s.valueFunc(s.key);
        this.setupExpire(s);
      }
      result = s.value;
    }
    if (result == null && this.valueFunction) {
      result = await this.valueFunction(key);
      this.put(key, result, this.expire, this.timeoutCallback);
    }
    return result;
  }

  async put(key: (string | number | symbol), val: any, expire?: number, timeoutCallback?: StoreCallback): Promise<boolean> {
    try {
      if (typeof expire !== 'undefined' && (typeof expire !== 'number' || isNaN(expire) || expire <= 0)) {
        throw new Error("timeout is not a number or less then 0");
      }

      if (timeoutCallback && typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
        throw new Error('Cache timeout callback must be a function');
      }

      let rec: StoreValue = new StoreValue();
      rec.key = key;
      if (val && typeof val === 'function') {
        rec.valueFunc = val;
        rec.value = await rec.valueFunc(rec.key);
      } else {
        rec.value = val;
      }
      rec.expire = expire;
      rec.timeoutCallback = timeoutCallback;
      this.setupExpire(rec);
      this._store.set(key.toString(), rec);

      // Removing Overlimit element
      let keysLength = this._keys.push(key.toString());
      if (this.limit && keysLength > this.limit) {
        let firstKey = this._keys.shift();
        this.del(firstKey);
      }
      return rec.value;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  del(key: (string | number | symbol)): boolean {
    if (key) {
      key = key.toString();
    } else {
      return false;
    }
    let keyIndex = this._keys.indexOf(key);
    if (keyIndex != -1) {
      this._keys.splice(keyIndex, 1);
    }
    let val = this._store.get(key);
    if (val) {
      if (val.timeout) {
        clearTimeout(val.timeout);
      }
      this._store.delete(key.toString());
      return true;
    }
    return false;
  }

  clear(): void {
    for (let key of this._keys) {
      this.del(key);
    }
  }

  size(): number {
    return this._keys.length;
  }

  keys(): Array<any> {
    return this._keys;
  }

}

export default Cache;
