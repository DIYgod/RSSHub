const Lru = require('lru-cache');
const config = require('@/config').value;

const status = { available: false };

const pageCache = new Lru({
    ttl: config.cache.routeExpire * 1000,
    max: Math.pow(2, 8),
});

const routeCache = new Lru({
    ttl: config.cache.routeExpire * 1000,
    max: Math.pow(2, 8),
    updateAgeOnGet: true,
});

status.available = true;

module.exports = {
    get: (key, refresh = true) => {
        if (key && status.available) {
            let value = (refresh ? routeCache : pageCache).get(key);
            if (value) {
                value = value + '';
            }
            return value;
        }
    },
    set: (key, value, maxAge = config.cache.contentExpire, refresh = true) => {
        if (!value || value === 'undefined') {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        if (key && status.available) {
            return (refresh ? routeCache : pageCache).set(key, value, { ttl: maxAge * 1000 });
        }
    },
    clients: { pageCache, routeCache },
    status,
};
