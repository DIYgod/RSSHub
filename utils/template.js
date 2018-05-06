const art = require('art-template');
const path = require('path');
const config = require('../config');

module.exports = function (options) {
    return art(path.resolve(__dirname, '../views/rss.art'), {
        lastBuildDate: new Date().toUTCString(),
        ttl: config.cacheExpire,
        ...options,
    });
};