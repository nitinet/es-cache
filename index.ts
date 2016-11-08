/// <reference path="/usr/local/lib/typings/globals/node/index.d.ts" />

interface StoreCallback {
  (key?: (string | number | symbol)): any;
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
  _store: Map<String, StoreValue> = new Map<String, StoreValue>();

  valueFunc: StoreCallback = null;
  expire: number = 86400000;
  timeoutCallback: StoreCallback = null;

  constructor(valueFunc?: StoreCallback, expire?: number, timeoutCallback?: StoreCallback) {
    this.valueFunc = valueFunc ? valueFunc : null;
    this.expire = expire ? expire : this.expire;
    this.timeoutCallback = timeoutCallback ? timeoutCallback : null;
  }

  private setupExpire(store: StoreValue) {
    if (store.expire && !isNaN(store.expire)) {
      store.timeout = setTimeout(function () {
        store.value = null;
        if (store.timeoutCallback) {
          store.timeoutCallback(store.key);
        }
      }, store.expire);
    }
  }

  get(key: (string | number | symbol)): any {
    let s = this._store.get(key.toString());
    let result = null;
    if (s) {
      if (s.value == null && s.valueFunc) {
        s.value = s.valueFunc(s.key);
        this.setupExpire(s);
      }
      result = s.value;
    }
    if (result == null && this.valueFunc) {
      result = this.valueFunc(key);
      this.put(key, result, this.expire, this.timeoutCallback);
    }
    return result;
  }

  put(key: (string | number | symbol), val: any, expire?: number, timeoutCallback?: StoreCallback): boolean {
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
        rec.value = rec.valueFunc(rec.key);
      } else {
        rec.value = val;
      }
      rec.expire = expire;
      rec.timeoutCallback = timeoutCallback;
      this.setupExpire(rec);
      this._store.set(key.toString(), rec);
      return rec.value;
    } catch (Error) {
      return null;
    }
  }

  del(key: (string | number | symbol)): boolean {
    if (key) {
      key = key.toString();
    } else {
      return false;
    }
    let rec = this._store.get(<string>key);
    if (rec) {
      clearTimeout(rec.timeout);
      this._store.delete(key.toString());
      return true;
    }
    return false;
  }

  clear(): void {
    for (let val of this._store.values()) {
      clearTimeout(val.timeout);
    }
    this._store.clear();
  }

  size(): number {
    return this._store.size;
  }

  keys(): Array<any> {
    let res: Array<String> = new Array<String>();
    for (let key of this._store.keys()) {
      res.push(key);
    }
    return res;
  }

}

export default Cache;
