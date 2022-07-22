const art = require('art-template');
const Lru = require('lru-cache');
const config = require('@/config').value;

const memoryCache = new Lru({
    ttl: config.cache.routeExpire * 1000,
    max: config.memory.max / 2,
});

/**
 * @param {string} templatePath
 * @param {object} options
 * @return {(data: object) => string})}
 */
const cachedCompileArtTemplate = (templatePath) => {
    if (memoryCache.has(templatePath)) {
        return memoryCache.get(templatePath, { updateAgeOnGet: true });
    }

    const fn = art.compile(templatePath);

    if (typeof fn === 'function') {
        memoryCache.set(templatePath, fn);
    }
    return fn;
};

/**
 * @param {string} templatePath
 * @param {object} data
 * @returns {string}
 */
const render = (templatePath, data) => cachedCompileArtTemplate(templatePath)(data);

module.exports = {
    art: render,
};
