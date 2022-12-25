class IStore {
    valueFunction = null;
    expire = 86400000;
    timeoutCallback = null;
    limit = null;
    valueType = null;
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
                return BigInt(value.substring(0, value.length - 1));
            }
            else {
                return value;
            }
        });
        return res;
    }
    async toValueType(obj) {
        let res = null;
        if (this.valueType) {
            try {
                let transformer = await import('class-transformer');
                if (transformer)
                    res = transformer.plainToClass(this.valueType, obj, { excludeExtraneousValues: true });
            }
            catch (err) {
                console.error(err);
            }
        }
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
export default IStore;
//# sourceMappingURL=IStore.js.map