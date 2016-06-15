/// <reference path="/usr/local/lib/typings/globals/node/index.d.ts" />

interface StoreCallback {
  (key?: (string | number | symbol)): any;
}

class StoreValue {
  key: any;
  value: any;
  valueFunc: StoreCallback;
  expire: number;
  timeout: NodeJS.Timer;

  constructor() { }

  refresh() {
    if (!isNaN(this.expire)) {
      let x = this;
      this.timeout = setTimeout(function () {
        x.value = null;
        if (x.valueFunc) {
          x.value = x.valueFunc(x.key);
          x.refresh();
        }
      }, this.expire);
    }
  }

}

class Cache {
  _store: Map<String, StoreValue> = new Map<String, StoreValue>();

  constructor() { }

  get(key: (string | number | symbol)): any {
    let s = this._store.get(key.toString());
    if (s) {
      return s.value;
    }
    return null;
  }

  put(key: (string | number | symbol), val: any, expire?: number, timeoutCallback?: StoreCallback): boolean {
    try {
      if (typeof expire !== 'undefined' && (typeof expire !== 'number' || isNaN(expire) || expire <= 0)) {
        throw new Error("timeout is not a number or less then 0");
      }

      if (typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
        throw new Error('Cache timeout callback must be a function');
      }

      let rec: StoreValue = new StoreValue();
      rec.key = key;
      rec.expire = expire;
      if (val && typeof val === 'function') {
        rec.valueFunc = val;
        rec.value = rec.valueFunc(rec.key);
      } else {
        rec.value = val;
      }
      if (!isNaN(rec.expire)) {
        let x = this;
        if (rec.valueFunc) {
          rec.refresh();
        } else {
          rec.timeout = setTimeout(function () {
            x.del(rec.key);
            if (timeoutCallback) {
              timeoutCallback(key);
            }
          }, rec.expire);
        }
      }
      this._store.set(key.toString(), rec);
      return rec.value;
    } catch (Error) {
      return null;
    }
  }

  del(key: (string | number | symbol)): boolean {
    let rec = this._store.get(key.toString());
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
