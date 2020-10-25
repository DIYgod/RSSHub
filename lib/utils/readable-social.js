const fallback = (a, b, c) => {
    if (a !== undefined && a !== null) {
        return a;
    }
    if (b !== undefined && b !== null) {
        return b;
    }
    if (c !== undefined && c !== null) {
        return c;
    }
};

const queryToToBoolean = (s) => {
    if (s === undefined || s === null) {
        return s;
    }
    if (Array.isArray(s)) {
        if (s.length === 0) {
            return undefined;
        }
        s = s[0];
    }
    s = s.toString();
    if (s.toLowerCase() === 'false' || s === '0') {
        return false;
    }
    return true;
};

const queryToToInteger = (s) => {
    if (s === undefined || s === null) {
        return s;
    }
    if (Array.isArray(s)) {
        if (s.length === 0) {
            return undefined;
        }
        s = s[0];
    }
    s = s.toString();
    return parseInt(s);
};

module.exports = {
    fallback,
    queryToToBoolean,
    queryToToInteger,
};
