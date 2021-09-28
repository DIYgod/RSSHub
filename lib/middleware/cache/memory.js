import Lru from 'lru-cache';
import { get as getConfig } from '@/config/index.js';
const config = getConfig();

const status = { available: false };

const pageCache = new Lru({
    maxAge: config.cache.routeExpire * 1000,
    max: Infinity,
});

const routeCache = new Lru({
    maxAge: config.cache.routeExpire * 1000,
    max: Infinity,
    updateAgeOnGet: true,
});

status.available = true;

export default {
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
            return (refresh ? routeCache : pageCache).set(key, value, maxAge * 1000);
        }
    },
    clients: { pageCache, routeCache },
    status,
};
