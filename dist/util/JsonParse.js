"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function JsonParse(json, type) {
    let obj = JSON.parse(json);
    let res = fill(obj, type);
    return res;
}
function fill(obj, type) {
    let res = null;
    if (obj == null) {
    }
    else if (Array.isArray(obj)) {
        res = [];
        obj.forEach((val, i) => {
            res[i] = val;
        });
    }
    else if (typeof obj == 'object') {
        let keys = Reflect.ownKeys(obj);
        res = new type();
        keys.forEach(key => {
            let val = obj[key];
            if (isPrimitive(res[key])) {
                res[key] = val;
            }
            else {
                let propType = res[key].constructor;
                res[key] = fill(val, propType);
            }
        });
    }
    else {
        res = new type(obj);
    }
    return res;
}
function isPrimitive(test) {
    return (test !== Object(test));
}
exports.default = JsonParse;
