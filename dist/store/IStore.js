import * as crypto from 'crypto';
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
            return null;
        }
        else if (typeof key == 'string' || typeof key == 'number' || typeof key == 'boolean' || typeof key == 'symbol') {
            return key.toString();
        }
        else {
            let hash = crypto.createHash('sha256');
            hash.update(JSON.stringify(key));
            return hash.digest('latin1');
        }
    }
}
export default IStore;
//# sourceMappingURL=IStore.js.map