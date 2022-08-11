const Lru = require('lru-cache');
const config = require('@/config').value;

const status = { available: false };

const memoryCache = new Lru({
    ttl: config.cache.routeExpire * 1000,
    max: config.memory.max,
});

status.available = true;

module.exports = {
    get: (key, refresh = true) => {
        if (key && status.available) {
            let value = memoryCache.get(key, { updateAgeOnGet: refresh });
            if (value) {
                value = value + '';
            }
            return value;
        }
    },
    set: (key, value, maxAge = config.cache.contentExpire) => {
        if (!value || value === 'undefined') {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        if (key && status.available) {
            return memoryCache.set(key, value, { ttl: maxAge * 1000 });
        }
    },
    clients: { memoryCache },
    status,
};
