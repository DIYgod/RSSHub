const decamelize = require('decamelize');
const config = require('./default');

const KEY = Symbol();

function isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object;
}

function ProxyFactory(obj) {
    // eslint-disable-next-line lines-around-comment
    /**
     * Handler with getter to return env/value/Proxy<-object when inspecting configs
     *
     * @type {{get}}
     */
    const configHandler = {
        get: (target, key, receiver) => {
            // Concat to the matched name required for env
            // e.g. config.redis.url -> REDIS_URL
            const envName = [Reflect.get(target, KEY, receiver), key]
                // exclude void, undefined and null
                .filter(Boolean)
                .map((_) => decamelize(_.toString()).toUpperCase())
                .join('_');
            // Return the environment variable if there is one
            const p = process.env[envName];
            if (p) {
                return p;
            }
            // Get original value/object
            const o = Reflect.get(target, key, receiver);
            // Return the value/undefined
            if (!isObject(o)) {
                return o;
            }
            // Return ProxyFactory(obj) with new object appended with a Symbol key to store envName
            return ProxyFactory(
                {
                    ...o,
                    [KEY]: envName,
                },
                configHandler
            );
        },
    };
    return new Proxy(obj, configHandler);
}

/**
 * Loader for environmental variable configs named after <SERVICE_FIELD> if set else config
 *
 * @type {Proxy}
 */
module.exports = ProxyFactory(config);
